import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import styled from "styled-components";

if (
  typeof CanvasRenderingContext2D !== "undefined" &&
  !CanvasRenderingContext2D.prototype.roundRect
) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

const drawSpeechBubble = (ctx, text, x, y, width, height, tailX, tailY) => {
  const radius = 5;

  ctx.fillStyle = "white";
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + width - 10, y + height);
  ctx.lineTo(tailX, tailY);
  ctx.lineTo(x + width - 18, y + height);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.save();

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.clip();

  ctx.fillStyle = "#000";
  ctx.font = "bold 9px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const padding = 1;
  const maxWidth = width - padding * 2;
  const maxHeight = height - padding * 2;
  let lineHeight = 10;
  let lines = [];

  const words = text.split(" ");
  let line = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = line + (line ? " " : "") + words[i];
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && line) {
      lines.push(line);
      line = words[i];
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line);

  const maxLines = Math.floor(maxHeight / lineHeight);
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines - 1);
    if (lines.length > 0) {
      let lastLine = lines[lines.length - 1];
      while (
        lastLine.length > 0 &&
        ctx.measureText(lastLine + "...").width > maxWidth
      ) {
        lastLine = lastLine.slice(0, -1);
      }
      lines[lines.length - 1] = lastLine.length > 0 ? lastLine + "..." : "...";
    }
  }

  const totalHeight = lines.length * lineHeight;
  const startY = y + (height - totalHeight) / 2 + lineHeight / 2;

  lines.forEach((l, i) => {
    ctx.fillText(l, x + width / 2, startY + i * lineHeight);
  });

  ctx.restore();
};

const FloodGame = ({
  onBack,
  onScoreIncrement,
  onScoreDecrement,
  score = 0,
}) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState("intro");
  const [collectedTrash, setCollectedTrash] = useState(0);
  const [totalTrash] = useState(25);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [fullscreenExitReason, setFullscreenExitReason] = useState("");
  const hasCompletionAlertedRef = useRef(false);
  const gamePlayingRef = useRef(false);

  const dragStateRef = useRef({
    isDragging: false,
    draggedItem: null,
    offsetX: 0,
    offsetY: 0,
  });

  const binElementRef = useRef(null);
  const [binScale, setBinScale] = useState(1);
  const [binRotation, setBinRotation] = useState(0);
  const [isTrashDragging, setIsTrashDragging] = useState(false);
  const characterReactUntilRef = useRef(0);
  const characterReactStartRef = useRef(0);

  const imagesRef = useRef({});

  // Fungsi untuk request fullscreen
  const requestFullscreen = async () => {
    const element = document.documentElement;
    try {
      // Skip jika sudah fullscreen
      if (isFullscreenActive()) {
        return;
      }

      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
    } catch (error) {
      // Abaikan error jika sudah fullscreen atau permission denied
      if (error.name === "NotAllowedError") {
        console.log("Fullscreen request blocked by user or browser");
      } else if (error.name === "TypeError") {
        console.log("Fullscreen request failed:", error.message);
      }
    }
  };

  // Fungsi untuk check apakah sedang fullscreen
  const isFullscreenActive = () => {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  };

  // Fungsi untuk exit fullscreen
  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  const triggerCharacterReaction = () => {
    const now = Date.now();
    characterReactStartRef.current = now;
    characterReactUntilRef.current = now + 650;
    redrawCanvas();
  };

  const gameStateRef = useRef({
    trashItems: [],
    trashBin: { x: 0, y: 0, width: 0, height: 0 },
    people: [],
    deadTrees: [],
    floodHeight: 0,
    maxFloodHeight: 0,
    groundLevel: 0,
    canvasWidth: 0,
    canvasHeight: 0,
    dpr: 1,
    hillX: 0,
    hillWidth: 0,
    hillHeight: 0,
    hillPeakY: 0,
    hillBaseY: 0,
    showTrash: false,
    showPeopleDialog: false,
    waveValue: 0,
  });

  const calculateDimensions = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.visualViewport
      ? window.visualViewport.height
      : window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    gameStateRef.current.canvasWidth = width;
    gameStateRef.current.canvasHeight = height;
    gameStateRef.current.dpr = dpr;

    const soilHeight = 20;
    gameStateRef.current.groundLevel = height - soilHeight;

    const isMobile = width < 768;
    const floodHeightRatio = isMobile ? 0.35 : 0.4;
    gameStateRef.current.maxFloodHeight =
      gameStateRef.current.groundLevel * floodHeightRatio;

    if (isMobile && totalTrash > 10) {
      gameStateRef.current.maxTrashItems = Math.floor(totalTrash * 0.7);
    } else {
      gameStateRef.current.maxTrashItems = totalTrash;
    }

    const binSize = Math.max(30, 50 * Math.min(width / 1200, height / 800));

    const farthestTrashX = Math.max(
      ...gameStateRef.current.trashItems.map((t) => t.x),
      width,
    );

    const rightMargin = 100;

    const hillWidth = Math.max(
      width * 0.55,
      farthestTrashX + rightMargin - width * 0.3,
    );

    const hillX = Math.max(width - hillWidth, width * 0.3);

    const hillHeight = isMobile
      ? gameStateRef.current.groundLevel * 0.45
      : gameStateRef.current.groundLevel * 0.5;

    const hillBaseY = gameStateRef.current.groundLevel;
    const hillPeakY = Math.min(
      gameStateRef.current.groundLevel - hillHeight,
      gameStateRef.current.groundLevel -
        gameStateRef.current.maxFloodHeight -
        30,
    );

    const binX = hillX + hillWidth * 0.25;
    const binY = hillPeakY + hillHeight * 0.4;

    gameStateRef.current.trashBin = {
      x: binX,
      y: binY,
      width: binSize,
      height: binSize,
    };

    gameStateRef.current.hillX = hillX;
    gameStateRef.current.hillWidth = hillWidth;
    gameStateRef.current.hillHeight = hillHeight;
    gameStateRef.current.hillPeakY = hillPeakY;
    gameStateRef.current.hillBaseY = hillBaseY;

    return dpr;
  };

  const initializeTrash = () => {
    const width = gameStateRef.current.canvasWidth;
    const height = gameStateRef.current.canvasHeight;
    const groundLevel = gameStateRef.current.groundLevel;
    const maxFlood = gameStateRef.current.maxFloodHeight;
    const scale = Math.min(width / 1200, height / 800);

    const itemSize = Math.max(50, Math.min(120, 60 * scale));

    const fixedBinSize = Math.max(
      30,
      50 * Math.min(width / 1200, height / 800),
    );
    const fixedBinX = width - fixedBinSize - 20;
    const fixedBinY = height - fixedBinSize - 20;
    const binMargin = 100;

    gameStateRef.current.baseItemSize = itemSize;

    const items = [];
    const trashImages = ["sampah1", "sampah2", "sampah3", "sampah4"];

    const waterSurfaceY = groundLevel - maxFlood;
    const waterBottomY = groundLevel;

    const maxTrashToSpawn = gameStateRef.current.maxTrashItems || totalTrash;
    for (let i = 0; i < maxTrashToSpawn; i++) {
      let x, y;
      let validPosition = false;

      const xMin = 25;
      const xMax = Math.max(xMin, width - itemSize - 50);
      let attempts = 0;
      const maxAttempts = 60;

      while (!validPosition && attempts < maxAttempts) {
        attempts++;
        x = Math.random() * (xMax - xMin) + xMin;
        y = Math.random() * (waterBottomY - waterSurfaceY) + waterSurfaceY;

        if (
          !(
            x + itemSize > fixedBinX - binMargin &&
            x < fixedBinX + fixedBinSize + binMargin &&
            y + itemSize > fixedBinY - binMargin &&
            y < fixedBinY + fixedBinSize + binMargin
          )
        ) {
          validPosition = true;
        }
      }

      if (!validPosition) {
        x = Math.random() * (xMax - xMin) + xMin;
        y = Math.random() * (waterBottomY - waterSurfaceY) + waterSurfaceY;
      }

      items.push({
        id: i,
        x: x,
        y: y,
        baseY: y,
        width: itemSize,
        height: itemSize,
        type: trashImages[i % trashImages.length],
        collected: false,
        depth: Math.random(),
      });
    }

    gameStateRef.current.trashItems = items;

    const dialogues = [
      "Bantu kami!",
      "Aku takut!",
      "Buang semua sampah itu!",
      "Ada sampah!",
      "Tolong kami!",
    ];
    const reactionDialogues = [
      "Yeay! Mantap!",
      "Wah, bersih!",
      "Hebat! Lanjut!",
      "Terima kasih!",
    ];

    const people = [];

    const personWidth = Math.max(
      135,
      165 * Math.min(width / 1200, height / 800),
    );

    gameStateRef.current.basePersonWidth = personWidth;

    const hillX = gameStateRef.current.hillX;
    const hillWidth = gameStateRef.current.hillWidth;
    const hillPeakY = gameStateRef.current.hillPeakY;

    const hillPositions = [
      { xRatio: 0.387, yOffset: 50, type: "karakter1", sizeScale: 1 },
      { xRatio: 0.61, yOffset: 20, type: "karakter2", sizeScale: 0.75 },
    ];

    for (let i = 0; i < 2; i++) {
      const pos = hillPositions[i];
      const personSize = personWidth * (pos.sizeScale || 1);
      const personX = hillX + hillWidth * pos.xRatio - personSize / 2;
      const personY = hillPeakY - pos.yOffset;

      people.push({
        id: i,
        x: personX,
        y: personY,
        width: personSize,
        height: personSize,
        type: pos.type,
        dialogue: dialogues[Math.floor(Math.random() * dialogues.length)],
        reactionDialogue:
          reactionDialogues[
            Math.floor(Math.random() * reactionDialogues.length)
          ],
        depth: 1,
      });
    }

    gameStateRef.current.people = people;
  };

  const animateFloodIntro = () => {
    const timeline = gsap.timeline();
    const maxFlood = gameStateRef.current.maxFloodHeight;

    timeline.to(gameStateRef.current, {
      floodHeight: maxFlood,
      duration: 3,
      ease: "power2.inOut",
      onUpdate: () => {
        redrawCanvas();
      },
    });

    timeline.to(
      canvasRef.current,
      {
        x: 3,
        duration: 0.08,
        repeat: 25,
        yoyo: true,
        ease: "power1.inOut",
      },
      0,
    );

    timeline.call(() => {
      initializeTrash();
      gameStateRef.current.showTrash = true;
      gameStateRef.current.showPeopleDialog = true;
      animateTrashAppearance();
      setGameState("playing");
      startContinuousWaterAnimation();
      redrawCanvas();
    });
    return timeline;
  };

  const startContinuousWaterAnimation = () => {
    if (waterAnimationRef.current) {
      waterAnimationRef.current.kill();
      waterAnimationRef.current = null;
    }

    const waterObj = { wave: 0 };

    const createWaveAnimation = () => {
      const tween = gsap.to(waterObj, {
        wave: Math.PI * 2,
        duration: 4,
        ease: "sine.inOut",
        onUpdate: () => {
          const maxFlood = gameStateRef.current.maxFloodHeight;
          const amplitude = maxFlood * 0.1;
          gameStateRef.current.floodHeight =
            maxFlood + Math.sin(waterObj.wave) * amplitude;
          gameStateRef.current.waveValue = waterObj.wave;
          redrawCanvas();
        },
        onComplete: () => {
          waterObj.wave = 0;

          if (waterAnimationRef.current !== null) {
            waterAnimationRef.current = createWaveAnimation();
          }
        },
      });
      return tween;
    };

    waterAnimationRef.current = createWaveAnimation();
  };

  const animateTrashAppearance = () => {
    let animatingCount = gameStateRef.current.trashItems.length;

    gameStateRef.current.trashItems.forEach((item, index) => {
      const startY = gameStateRef.current.canvasHeight;
      const endY = item.y;
      const delay = index * 0.1;

      gsap.fromTo(
        item,
        { y: startY },
        {
          y: endY,
          duration: 0.6,
          delay: delay,
          ease: "back.out",
          onUpdate: () => {
            redrawCanvas();
          },
          onComplete: () => {
            animatingCount--;
            if (animatingCount === 0) {
              redrawCanvas();
            }
          },
        },
      );
    });
  };

  const drawGround = (ctx) => {
    const groundLevel = gameStateRef.current.groundLevel;
    const width = gameStateRef.current.canvasWidth;
    const height = gameStateRef.current.canvasHeight;

    const soilHeight = height - groundLevel;

    ctx.fillStyle = "#8B7355";
    ctx.beginPath();
    ctx.moveTo(0, groundLevel);
    ctx.lineTo(width, groundLevel);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#228B22";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundLevel);
    ctx.lineTo(width, groundLevel);
    ctx.stroke();
  };

  const drawWater = (ctx) => {
    const groundLevel = gameStateRef.current.groundLevel;
    const floodHeight = gameStateRef.current.floodHeight;
    const width = gameStateRef.current.canvasWidth;

    if (floodHeight > 0) {
      ctx.fillStyle = "rgba(70, 130, 180, 0.6)";
      ctx.fillRect(0, groundLevel - floodHeight, width, floodHeight);

      ctx.strokeStyle = "rgba(100, 150, 200, 0.7)";
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i <= width; i += 25) {
        const wave = Math.sin(i * 0.008 + gameStateRef.current.waveValue) * 5;
        const y = groundLevel - floodHeight + wave;
        ctx.lineTo(i, y);
      }
      ctx.stroke();
    }
  };

  const drawHill = (ctx) => {
    const groundLevel = gameStateRef.current.groundLevel;
    const floodHeight = gameStateRef.current.floodHeight;

    const hillX = gameStateRef.current.hillX;
    const hillWidth = gameStateRef.current.hillWidth;
    const hillHeight = gameStateRef.current.hillHeight;
    const hillBaseY = gameStateRef.current.hillBaseY;
    const hillPeakY = gameStateRef.current.hillPeakY;

    const hillGradient = ctx.createLinearGradient(0, hillPeakY, 0, hillBaseY);
    hillGradient.addColorStop(0, "#90EE90");
    hillGradient.addColorStop(0.5, "#7CCD7C");
    hillGradient.addColorStop(1, "#6B8E6B");

    ctx.fillStyle = hillGradient;

    ctx.beginPath();
    ctx.moveTo(hillX, hillBaseY);

    ctx.bezierCurveTo(
      hillX,
      hillBaseY,
      hillX + hillWidth * 0.2,
      hillPeakY + hillHeight * 0.5,
      hillX + hillWidth * 0.25,
      hillPeakY,
    );

    ctx.bezierCurveTo(
      hillX + hillWidth * 0.25,
      hillPeakY,
      hillX + hillWidth * 0.5,
      hillPeakY - hillHeight * 0.15,
      hillX + hillWidth * 0.75,
      hillPeakY,
    );

    ctx.bezierCurveTo(
      hillX + hillWidth * 0.75,
      hillPeakY,
      hillX + hillWidth * 0.9,
      hillPeakY + hillHeight * 0.4,
      hillX + hillWidth,
      hillBaseY,
    );

    ctx.lineTo(hillX + hillWidth, hillBaseY);
    ctx.fill();

    ctx.strokeStyle = "#4a6b4a";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = "rgba(0, 100, 0, 0.3)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const startX = hillX + (hillWidth / 4) * i;
      const startY = hillBaseY - 5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + 15, startY - 10);
      ctx.stroke();
    }

    if (floodHeight > 0) {
      const waterLevel = groundLevel - floodHeight;
      const floodedHeight = Math.max(0, hillBaseY - waterLevel);

      if (floodedHeight > 0) {
        ctx.fillStyle = "rgba(100, 150, 180, 0.15)";

        ctx.beginPath();
        ctx.moveTo(hillX, hillBaseY);
        ctx.lineTo(hillX, waterLevel);
        ctx.lineTo(hillX + hillWidth * 0.25, waterLevel);
        ctx.bezierCurveTo(
          hillX + hillWidth * 0.25,
          waterLevel,
          hillX + hillWidth * 0.3,
          waterLevel + 10,
          hillX + hillWidth * 0.35,
          hillBaseY,
        );
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(hillX + hillWidth, hillBaseY);
        ctx.lineTo(hillX + hillWidth, waterLevel);
        ctx.lineTo(hillX + hillWidth * 0.75, waterLevel);
        ctx.bezierCurveTo(
          hillX + hillWidth * 0.75,
          waterLevel,
          hillX + hillWidth * 0.7,
          waterLevel + 10,
          hillX + hillWidth * 0.65,
          hillBaseY,
        );
        ctx.fill();
      }
    }
  };

  const drawTrashItems = (ctx) => {
    const groundLevel = gameStateRef.current.groundLevel;
    const floodHeight = gameStateRef.current.floodHeight;
    const waveValue = gameStateRef.current.waveValue;
    const isMobile = gameStateRef.current.canvasWidth < 768;

    const itemsWithDepth = gameStateRef.current.trashItems
      .filter((item) => !item.collected)
      .sort((a, b) => a.depth - b.depth);

    itemsWithDepth.forEach((item) => {
      const z = item.depth;
      const scale = 0.6 + z * 0.4;

      const scaledWidth = item.width * scale;
      const scaledHeight = item.height * scale;
      const x = item.x + (1 - z) * item.width * 0.2;

      let waveOffset = 0;
      if (!isMobile || item.id % 2 === 0) {
        const waveAmplitude = item.width * 0.1;
        waveOffset = Math.sin(waveValue) * waveAmplitude;
      }
      const y = item.y + (1 - z) * item.height * 0.1 + waveOffset;

      if (!isMobile) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(x + 2, y + scaledHeight + 1, scaledWidth - 4, 2);
      }

      const image = imagesRef.current[item.type];
      if (image && image.complete) {
        ctx.save();

        if (item.rotation) {
          ctx.translate(x + scaledWidth / 2, y + scaledHeight / 2);
          ctx.rotate(item.rotation);
          ctx.drawImage(
            image,
            -scaledWidth / 2,
            -scaledHeight / 2,
            scaledWidth,
            scaledHeight,
          );
          ctx.restore();
        } else {
          ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
        }
      }
    });
  };

  const drawThankfulCharacter = (ctx) => {
    const padding = 20;
    const characterSize = 60;
    const x = padding;
    const y = gameStateRef.current.canvasHeight - characterSize - padding;

    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.fillRect(x + 2, y + characterSize + 2, characterSize - 4, 3);

    ctx.fillStyle = "#4ECDC4";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, characterSize, characterSize);
    ctx.strokeRect(x, y, characterSize, characterSize);

    const eyeSize = characterSize * 0.12;
    const leftEyeX = x + characterSize * 0.32;
    const rightEyeX = x + characterSize * 0.68;
    const eyeY = y + characterSize * 0.3;

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(leftEyeX, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rightEyeX, eyeY, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(
      x + characterSize / 2,
      y + characterSize * 0.65,
      characterSize * 0.18,
      0,
      Math.PI,
    );
    ctx.stroke();

    const bubbleWidth = characterSize * 2.5;
    const bubbleHeight = characterSize * 0.7;
    const bubbleX = x + characterSize + 15;
    const bubbleY = y + characterSize / 2 - bubbleHeight / 2;
    const tailX = x + characterSize;
    const tailY = y + characterSize / 2;

    drawSpeechBubble(
      ctx,
      "Terima Kasih!",
      bubbleX,
      bubbleY,
      bubbleWidth,
      bubbleHeight,
      tailX,
      tailY,
    );
  };

  const drawPeople = (ctx) => {
    const canvasWidth = gameStateRef.current.canvasWidth;
    const padding = 5;
    const isMobile = canvasWidth < 768;

    gameStateRef.current.people.forEach((person) => {
      const now = Date.now();
      const reactStart = characterReactStartRef.current;
      const reactEnd = characterReactUntilRef.current;
      const reactDuration = Math.max(1, reactEnd - reactStart);
      const reactProgress = Math.max(
        0,
        Math.min(1, (now - reactStart) / reactDuration),
      );
      const isReacting = now < reactEnd;
      const z = person.depth;
      const baseScale = 0.8 + z * 0.2;

      const oneShotPulse = Math.sin(Math.PI * reactProgress);
      const reactScaleBoost = isReacting ? 0.06 * oneShotPulse : 0;
      const scale = baseScale + reactScaleBoost;

      const scaledWidth = person.width * scale;
      const scaledHeight = person.height * scale;
      const x = person.x + (1 - z) * person.width * 0.15;
      const y = person.y + (isReacting ? oneShotPulse * -4 : 0);

      if (!isMobile) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
        ctx.fillRect(x + 1, y + scaledHeight + 1, scaledWidth - 2, 2);
      }

      const imageKey = isReacting ? `${person.type}_act` : person.type;
      const image =
        imagesRef.current[imageKey] || imagesRef.current[person.type];
      if (image && image.complete) {
        ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
      } else {
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.fillRect(x, y, scaledWidth, scaledHeight);
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, scaledWidth, scaledHeight);
      }

      if (gameStateRef.current.showPeopleDialog) {
        let bubbleWidth = isMobile ? scaledWidth * 1.7 : scaledWidth * 2.2;
        const bubbleHeight = isMobile
          ? scaledHeight * 0.55
          : scaledHeight * 0.7;
        let bubbleX = x - bubbleWidth / 2 + scaledWidth / 2;
        const bubbleY = Math.max(
          padding,
          y - bubbleHeight - (isMobile ? 5 : 8),
        );
        const tailX = x + scaledWidth / 2;
        const tailY = y;

        if (bubbleX < padding) {
          bubbleX = padding;
        } else if (bubbleX + bubbleWidth > canvasWidth - padding) {
          bubbleX = canvasWidth - bubbleWidth - padding;
        }

        if (
          bubbleX >= padding &&
          bubbleX + bubbleWidth <= canvasWidth - padding &&
          bubbleY >= padding
        ) {
          drawSpeechBubble(
            ctx,
            isReacting ? person.reactionDialogue : person.dialogue,
            bubbleX,
            bubbleY,
            bubbleWidth,
            bubbleHeight,
            tailX,
            tailY,
          );
        }
      }
    });
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isMobile = gameStateRef.current.canvasWidth < 768;

    if (isMobile) {
      ctx.fillStyle = "#A8D8FF";
      ctx.fillRect(
        0,
        0,
        gameStateRef.current.canvasWidth,
        gameStateRef.current.groundLevel,
      );
    } else {
      const skyGradient = ctx.createLinearGradient(
        0,
        0,
        0,
        gameStateRef.current.groundLevel,
      );
      skyGradient.addColorStop(0, "#87CEEB");
      skyGradient.addColorStop(0.5, "#B0E0E6");
      skyGradient.addColorStop(1, "#E0F6FF");

      ctx.fillStyle = skyGradient;
      ctx.fillRect(
        0,
        0,
        gameStateRef.current.canvasWidth,
        gameStateRef.current.groundLevel,
      );
    }

    drawWater(ctx);
    drawGround(ctx);
    drawHill(ctx);
    if (gameStateRef.current.showTrash) {
      drawTrashItems(ctx);
    }
    drawPeople(ctx);

    ctx.fillStyle = "#000";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "left";
    // ctx.fillText(`Sampah: ${collectedTrash}/${totalTrash}`, 12, 25);

    if (gameState === "playing" && dragStateRef.current.isDragging) {
      ctx.font = "14px Arial";
      ctx.fillStyle = "#FF6B6B";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(255, 107, 107, 0.5)";
      ctx.shadowBlur = 10;
      ctx.fillText(
        "↓ Tarik sampah ke keranjang ↓",
        gameStateRef.current.canvasWidth / 2,
        45,
      );
      ctx.shadowColor = "transparent";
    }

    if (gameState === "completed") {
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.fillRect(
        0,
        0,
        gameStateRef.current.canvasWidth,
        gameStateRef.current.canvasHeight,
      );

      ctx.fillStyle = "#FFD700";
      ctx.font = "bold 30px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        "🎉 SELAMAT! 🎉",
        gameStateRef.current.canvasWidth / 2,
        gameStateRef.current.canvasHeight / 2 - 35,
      );

      ctx.fillStyle = "#FFF";
      ctx.font = "16px Arial";
      ctx.fillText(
        "Anda telah menyelamatkan kota!",
        gameStateRef.current.canvasWidth / 2,
        gameStateRef.current.canvasHeight / 2 + 25,
      );

      drawThankfulCharacter(ctx);
    }
  };

  const isPointInRect = (x, y, rect) => {
    return (
      x >= rect.x &&
      x <= rect.x + rect.width &&
      y >= rect.y &&
      y <= rect.y + rect.height
    );
  };

  const collectTrashItem = (item) => {
    // Jangan collect jika sudah dikumpulkan
    if (item.collected) return false;

    const fixedBinSize = Math.max(
      30,
      50 *
        Math.min(
          gameStateRef.current.canvasWidth / 1200,
          gameStateRef.current.canvasHeight / 800,
        ),
    );
    const fixedBinX = gameStateRef.current.canvasWidth - fixedBinSize - 20;
    const fixedBinY = gameStateRef.current.canvasHeight - fixedBinSize - 20;

    // Check collision dengan margin buffer untuk desktop
    const collisionMargin = 20;
    const collision =
      item.x < fixedBinX + fixedBinSize + collisionMargin &&
      item.x + item.width > fixedBinX - collisionMargin &&
      item.y < fixedBinY + fixedBinSize + collisionMargin &&
      item.y + item.height > fixedBinY - collisionMargin;

    if (!collision) return false;

    // Mark as collected
    item.collected = true;
    triggerCharacterReaction();
    const newCount = collectedTrash + 1;
    setCollectedTrash(newCount);

    // Increment score when trash is collected
    if (onScoreIncrement) {
      onScoreIncrement();
    }

    // Animate trash ke bin
    gsap.to(item, {
      x: fixedBinX + fixedBinSize / 2 - item.width / 2,
      y: fixedBinY - item.height / 2,
      rotation: Math.random() * 360 + 180,
      duration: 0.4,
      ease: "power2.in",
      onUpdate: () => {
        redrawCanvas();
      },
    });

    // Animate trash menghilang
    gsap.to(item, {
      y: fixedBinY + fixedBinSize / 2,
      scale: 0.1,
      opacity: 0,
      duration: 0.3,
      ease: "back.in",
      delay: 0.2,
      onUpdate: () => {
        redrawCanvas();
      },
      onComplete: () => {
        redrawCanvas();

        const allCollected = gameStateRef.current.trashItems.every(
          (t) => t.collected,
        );
        if (allCollected) {
          setGameState("completed");
        }
      },
    });

    // Bin reaction animation
    const binReactionTimeline = gsap.timeline();

    binReactionTimeline.to(
      {},
      {
        duration: 0.15,
        onUpdate: () => {
          const t = binReactionTimeline.progress();
          const bounceAmount = Math.sin(t * Math.PI) * 0.15;
          setBinScale(1 - bounceAmount);
        },
      },
    );

    binReactionTimeline.to(
      {},
      {
        duration: 0.15,
        onUpdate: () => {
          const t = binReactionTimeline.progress() - 0.5;
          if (t <= 0.3) {
            const bounceAmount = Math.sin((t / 0.3) * Math.PI) * 0.1;
            setBinScale(1 - bounceAmount);
          } else {
            setBinScale(1);
          }
        },
        onComplete: () => {
          setBinScale(1);
        },
      },
    );

    return true;
  };

  const handleMouseDown = (e) => {
    if (gameState !== "playing") return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const touchPadding = 10;

    const item = gameStateRef.current.trashItems.find((t) => {
      return (
        !t.collected &&
        x >= t.x - touchPadding &&
        x <= t.x + t.width + touchPadding &&
        y >= t.y - touchPadding &&
        y <= t.y + t.height + touchPadding
      );
    });
    if (item) {
      dragStateRef.current.isDragging = true;
      dragStateRef.current.draggedItem = item;
      dragStateRef.current.offsetX = x - item.x;
      dragStateRef.current.offsetY = y - item.y;
      setIsTrashDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!dragStateRef.current.isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    dragStateRef.current.draggedItem.x = x - dragStateRef.current.offsetX;
    dragStateRef.current.draggedItem.y = y - dragStateRef.current.offsetY;

    // Clamp trash ke dalam canvas bounds
    const canvasWidth = gameStateRef.current.canvasWidth;
    const canvasHeight = gameStateRef.current.canvasHeight;
    const item = dragStateRef.current.draggedItem;
    item.x = Math.max(0, Math.min(item.x, canvasWidth - item.width));
    item.y = Math.max(0, Math.min(item.y, canvasHeight - item.height));

    // Check dan collect sampah saat drag
    const collected = collectTrashItem(item);

    if (collected) {
      // Sampah sudah dikumpulkan, stop dragging
      dragStateRef.current.isDragging = false;
      dragStateRef.current.draggedItem = null;
      setIsTrashDragging(false);
      redrawCanvas();
      return;
    }

    const fixedBinSize = Math.max(
      30,
      50 *
        Math.min(
          gameStateRef.current.canvasWidth / 1200,
          gameStateRef.current.canvasHeight / 800,
        ),
    );
    const fixedBinX = gameStateRef.current.canvasWidth - fixedBinSize - 20;
    const fixedBinY = gameStateRef.current.canvasHeight - fixedBinSize - 20;

    const trashCenterX =
      dragStateRef.current.draggedItem.x +
      dragStateRef.current.draggedItem.width / 2;
    const trashCenterY =
      dragStateRef.current.draggedItem.y +
      dragStateRef.current.draggedItem.height / 2;
    const binCenterX = fixedBinX + fixedBinSize / 2;
    const binCenterY = fixedBinY + fixedBinSize / 2;

    const distance = Math.sqrt(
      Math.pow(trashCenterX - binCenterX, 2) +
        Math.pow(trashCenterY - binCenterY, 2),
    );

    const maxDistance = 200;
    if (distance < maxDistance) {
      const proximityFactor = 1 - distance / maxDistance;
      const scaleAmount = 1 + proximityFactor * 0.1;
      setBinScale(scaleAmount);
    } else {
      setBinScale(1);
    }

    redrawCanvas();
  };

  const handleMouseUp = (e) => {
    if (!dragStateRef.current.isDragging) return;

    const item = dragStateRef.current.draggedItem;

    // Try to collect trash (jika belum dikumpulkan saat drag)
    const collected = collectTrashItem(item);

    if (!collected) {
      // Jika tidak dikumpulkan, kembalikan sampah ke posisi awal

      const groundLevel = gameStateRef.current.groundLevel;
      const floodHeight = gameStateRef.current.floodHeight;
      const waterSurfaceY = groundLevel - floodHeight;

      if (item.y < waterSurfaceY) {
        gsap.to(item, {
          y: item.baseY,
          duration: 0.5,
          ease: "power2.in",
          onUpdate: () => {
            redrawCanvas();
          },
        });
      }
    }

    dragStateRef.current.isDragging = false;
    dragStateRef.current.draggedItem = null;
    setIsTrashDragging(false);
    redrawCanvas();
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    if (gameState !== "playing") return;

    const touchPadding = 10;

    const item = gameStateRef.current.trashItems.find((t) => {
      return (
        !t.collected &&
        x >= t.x - touchPadding &&
        x <= t.x + t.width + touchPadding &&
        y >= t.y - touchPadding &&
        y <= t.y + t.height + touchPadding
      );
    });

    if (item) {
      dragStateRef.current.isDragging = true;
      dragStateRef.current.draggedItem = item;
      dragStateRef.current.offsetX = x - item.x;
      dragStateRef.current.offsetY = y - item.y;
      setIsTrashDragging(true);
    }
  };

  const handleTouchMove = (e) => {
    if (!dragStateRef.current.isDragging) return;

    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    dragStateRef.current.draggedItem.x = x - dragStateRef.current.offsetX;
    dragStateRef.current.draggedItem.y = y - dragStateRef.current.offsetY;

    // Clamp trash ke dalam canvas bounds
    const canvasWidth = gameStateRef.current.canvasWidth;
    const canvasHeight = gameStateRef.current.canvasHeight;
    const item = dragStateRef.current.draggedItem;
    item.x = Math.max(0, Math.min(item.x, canvasWidth - item.width));
    item.y = Math.max(0, Math.min(item.y, canvasHeight - item.height));

    // Check dan collect sampah saat drag (untuk touch)
    const collected = collectTrashItem(item);

    if (collected) {
      // Sampah sudah dikumpulkan, stop dragging
      dragStateRef.current.isDragging = false;
      dragStateRef.current.draggedItem = null;
      setIsTrashDragging(false);
      redrawCanvas();
      return;
    }

    const fixedBinSize = Math.max(
      30,
      50 *
        Math.min(
          gameStateRef.current.canvasWidth / 1200,
          gameStateRef.current.canvasHeight / 800,
        ),
    );
    const fixedBinX = gameStateRef.current.canvasWidth - fixedBinSize - 20;
    const fixedBinY = gameStateRef.current.canvasHeight - fixedBinSize - 20;

    const trashCenterX =
      dragStateRef.current.draggedItem.x +
      dragStateRef.current.draggedItem.width / 2;
    const trashCenterY =
      dragStateRef.current.draggedItem.y +
      dragStateRef.current.draggedItem.height / 2;
    const binCenterX = fixedBinX + fixedBinSize / 2;
    const binCenterY = fixedBinY + fixedBinSize / 2;

    const distance = Math.sqrt(
      Math.pow(trashCenterX - binCenterX, 2) +
        Math.pow(trashCenterY - binCenterY, 2),
    );

    const maxDistance = 200;
    if (distance < maxDistance) {
      const proximityFactor = 1 - distance / maxDistance;
      const scaleAmount = 1 + proximityFactor * 0.1;
      setBinScale(scaleAmount);
    } else {
      setBinScale(1);
    }

    redrawCanvas();
  };

  const handleTouchEnd = (e) => {
    if (!dragStateRef.current.isDragging) return;

    const item = dragStateRef.current.draggedItem;

    // Try to collect trash (jika belum dikumpulkan saat drag)
    const collected = collectTrashItem(item);

    if (!collected) {
      // Jika tidak dikumpulkan, kembalikan sampah ke posisi awal

      const groundLevel = gameStateRef.current.groundLevel;
      const floodHeight = gameStateRef.current.floodHeight;
      const waterSurfaceY = groundLevel - floodHeight;

      if (item.y < waterSurfaceY) {
        gsap.to(item, {
          y: item.baseY,
          duration: 0.5,
          ease: "power2.in",
          onUpdate: () => {
            redrawCanvas();
          },
        });
      }
    }

    dragStateRef.current.isDragging = false;
    dragStateRef.current.draggedItem = null;
    setIsTrashDragging(false);
    redrawCanvas();
  };

  const resetGame = () => {
    hasCompletionAlertedRef.current = false;
    characterReactStartRef.current = 0;
    characterReactUntilRef.current = 0;
    setCollectedTrash(0);
    setGameState("intro");
    gameStateRef.current.showTrash = false;
    gameStateRef.current.showPeopleDialog = false;

    if (waterAnimationRef.current) {
      waterAnimationRef.current.kill();
      waterAnimationRef.current = null;
    }

    initializeTrash();
    calculateDimensions();
    redrawCanvas();
    animateFloodIntro();
  };

  const animationRef = useRef(null);
  const waterAnimationRef = useRef(null);

  const requestDraw = () => {
    if (animationRef.current) return;
    animationRef.current = requestAnimationFrame(() => {
      redrawCanvas();
      animationRef.current = null;
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    calculateDimensions();
    initializeTrash();
    redrawCanvas();

    if (gameState === "intro") {
      animateFloodIntro();
    }

    // Set gamePlayingRef saat game sedang dimainkan atau saat intro animation
    if (gameState === "intro" || gameState === "playing") {
      gamePlayingRef.current = true;
      // Request fullscreen jika belum fullscreen
      if (!isFullscreenActive()) {
        requestFullscreen();
      }
    } else if (gameState === "completed") {
      gamePlayingRef.current = false;
    }

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);

    const handleResize = () => {
      const oldWidth = gameStateRef.current.canvasWidth;
      const oldHeight = gameStateRef.current.canvasHeight;

      calculateDimensions();

      const newWidth = gameStateRef.current.canvasWidth;
      const newHeight = gameStateRef.current.canvasHeight;

      // Jika ada perubahan ukuran, reposition sampah dan karakter
      if (oldWidth !== newWidth || oldHeight !== newHeight) {
        const scaleX = newWidth / oldWidth;
        const scaleY = newHeight / oldHeight;

        // Reposition dan resize sampah
        gameStateRef.current.trashItems.forEach((item) => {
          item.x = item.x * scaleX;
          item.y = item.y * scaleY;
          item.baseY = item.baseY * scaleY;
          // Scale ukuran sampah
          const newItemSize = Math.max(
            50,
            Math.min(120, 60 * Math.min(newWidth / 1200, newHeight / 800)),
          );
          const sizeScale = newItemSize / gameStateRef.current.baseItemSize;
          item.width = item.width * sizeScale;
          item.height = item.height * sizeScale;
          // Clamp ke bounds baru
          item.x = Math.max(0, Math.min(item.x, newWidth - item.width));
          item.y = Math.max(0, Math.min(item.y, newHeight - item.height));
        });

        // Update base item size
        gameStateRef.current.baseItemSize = Math.max(
          50,
          Math.min(120, 60 * Math.min(newWidth / 1200, newHeight / 800)),
        );

        // Reposition dan resize karakter
        gameStateRef.current.people.forEach((person) => {
          person.x = person.x * scaleX;
          person.y = person.y * scaleY;
          // Scale ukuran karakter
          const newPersonWidth = Math.max(
            135,
            165 * Math.min(newWidth / 1200, newHeight / 800),
          );
          const personSizeScale =
            newPersonWidth / gameStateRef.current.basePersonWidth;
          person.width = person.width * personSizeScale;
          person.height = person.height * personSizeScale;
        });

        // Update base person width
        gameStateRef.current.basePersonWidth = Math.max(
          135,
          165 * Math.min(newWidth / 1200, newHeight / 800),
        );
      }

      redrawCanvas();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", handleResize);
    };
  }, [gameState]);

  useEffect(() => {
    redrawCanvas();
  }, [collectedTrash]);

  useEffect(() => {
    if (gameState === "completed" && !hasCompletionAlertedRef.current) {
      hasCompletionAlertedRef.current = true;
      window.alert("Terima kasih sudah membersihkan sampah");
      // Exit fullscreen sebelum kembali
      exitFullscreen();
      if (typeof onBack === "function") {
        onBack();
      }
    }
  }, [gameState]);
  useEffect(() => {
    const handleViewportResize = () => {
      calculateDimensions();
      redrawCanvas();
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          handleViewportResize,
        );
      }
    };
  }, []);

  useEffect(() => {
    const checkOrientation = () => {
      const width = window.innerWidth;
      const height = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;
      // Allow all orientations now - landscape and portrait supported
    };

    checkOrientation();

    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", checkOrientation);
    }

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", checkOrientation);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (waterAnimationRef.current) {
        waterAnimationRef.current.kill();
        waterAnimationRef.current = null;
      }
    };
  }, []);

  // Preload trash images
  useEffect(() => {
    const trashImages = ["sampah1", "sampah2", "sampah3", "sampah4"];
    const characterImages = [
      "karakter1",
      "karakter2",
      "karakter1_act",
      "karakter2_act",
    ];
    const images = {};

    trashImages.concat(characterImages).forEach((imageName) => {
      const img = new Image();
      img.src = `/components/1/${imageName}.png`;
      img.onload = () => {
        images[imageName] = img;
        imagesRef.current = { ...imagesRef.current, [imageName]: img };
      };
      img.onerror = () => {
        console.warn(`Failed to load image: /components/1/${imageName}.png`);
      };
    });
  }, []);

  // Clear fullscreen warning jika fullscreen berhasil di-request kembali
  useEffect(() => {
    if (isFullscreenActive() && showFullscreenWarning) {
      setShowFullscreenWarning(false);
      setFullscreenExitReason("");
    }
  }, [showFullscreenWarning]);

  // Fullscreen detection dan warning
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Jika sedang bermain (intro atau playing) dan keluar dari fullscreen, tampilkan warning dan force re-enter
      if (
        gamePlayingRef.current &&
        !isFullscreenActive() &&
        (gameState === "intro" || gameState === "playing")
      ) {
        // Kurangi score saat fullscreen diexit
        if (onScoreDecrement) {
          onScoreDecrement(15);
        }
        // Jika fullscreenExitReason belum diset (tidak dari ESC), set ke "fullscreen"
        setShowFullscreenWarning(true);
        if (fullscreenExitReason !== "escape") {
          setFullscreenExitReason("fullscreen");
        }
        // Otomatis request fullscreen kembali setelah 500ms
        setTimeout(() => {
          requestFullscreen();
        }, 500);
      }
    };

    const handleVisibilityChange = () => {
      // Jika tab menjadi hidden (user switch tab) saat game berlangsung
      if (
        document.hidden &&
        gamePlayingRef.current &&
        (gameState === "intro" || gameState === "playing")
      ) {
        // Kurangi score saat switch tab
        if (onScoreDecrement) {
          onScoreDecrement(10);
        }
      }
    };

    const handleKeyDown = (e) => {
      // Detect Escape key saat fullscreen aktif
      if (
        e.key === "Escape" &&
        gamePlayingRef.current &&
        (gameState === "intro" || gameState === "playing") &&
        isFullscreenActive()
      ) {
        // Tandai bahwa exit fullscreen dari ESC
        setFullscreenExitReason("escape");
        // Catatan: e.preventDefault() tidak bekerja untuk ESC dalam fullscreen
        // Browser akan keluar dari fullscreen, dan handleFullscreenChange akan menangani sisanya
      }
    };

    const handleBeforeUnload = (e) => {
      // Warning saat menutup tab/browser selama game berlangsung (belum selesai)
      if (
        gamePlayingRef.current &&
        (gameState === "intro" || gameState === "playing")
      ) {
        e.preventDefault();
        e.returnValue = "Anda masih bermain! Yakin ingin keluar?";
        return "Anda masih bermain! Yakin ingin keluar?";
      }
    };

    // Jika game sudah selesai, allow exit fullscreen
    if (gameState === "completed") {
      if (document.exitFullscreen && isFullscreenActive()) {
        // Game selesai, user bisa keluar dari fullscreen
      }
      return;
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "mozfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [gameState, onScoreDecrement]);

  return (
    <StyledContainer>
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          cursor: dragStateRef.current.isDragging ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none",
          WebkitTapHighlightColor: "transparent",
        }}
      />
      <FixedTrashBin
        ref={binElementRef}
        className={isTrashDragging ? "dragging" : ""}
        style={{
          transform: `scale(${binScale}) rotate(${binRotation}deg)`,
        }}
      >
        <img
          src="/components/1/tongSampah.png"
          alt="Trash Bin"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            pointerEvents: "none",
          }}
        />
      </FixedTrashBin>
      {gameState === "completed" && (
        <ButtonContainer>
          <RestartButton onClick={resetGame}>Ulangi Permainan</RestartButton>
        </ButtonContainer>
      )}

      {/* Fullscreen Warning Modal */}
      {showFullscreenWarning && (
        <FullscreenWarningOverlay>
          <FullscreenWarningModal>
            <WarningTitle>⚠️ Fokus Diperlukan!</WarningTitle>
            <WarningMessage>
              {fullscreenExitReason === "escape"
                ? "Anda tidak bisa keluar dari mode fullscreen dengan menekan ESC!"
                : "Permainan memerlukan fokus penuh! Score anda dikurangi!"}
            </WarningMessage>
            <WarningDescription>
              Fullscreen diperlukan untuk bermain game ini sesuai desain.
              Selesaikan permainan terlebih dahulu, kumpulkan semua sampah untuk
              menyelamatkan lingkungan! Anda otomatis dikembalikan ke
              fullscreen.
            </WarningDescription>
            <ButtonGroup>
              <ResumeButton
                onClick={() => {
                  setShowFullscreenWarning(false);
                  requestFullscreen();
                }}
              >
                ↩️ Kembali Fullscreen
              </ResumeButton>
              <ExitButton
                onClick={() => {
                  setShowFullscreenWarning(false);
                  gamePlayingRef.current = false;
                  // Decrement score saat keluar permainan
                  if (onScoreDecrement) {
                    onScoreDecrement(20);
                  }
                  // Exit fullscreen sebelum kembali
                  exitFullscreen();
                  if (typeof onBack === "function") {
                    onBack();
                  }
                }}
              >
                ✕ Keluar Permainan
              </ExitButton>
            </ButtonGroup>
          </FullscreenWarningModal>
        </FullscreenWarningOverlay>
      )}
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    max-height: 100vh;
  }
`;

const FixedTrashBin = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  transform-origin: center;
  transition: none;

  &.dragging {
    animation: glow-pulse 0.6s ease-in-out infinite;
    filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))
      drop-shadow(0 0 40px rgba(255, 165, 0, 0.6));
  }

  @keyframes glow-pulse {
    0%,
    100% {
      filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.6))
        drop-shadow(0 0 20px rgba(255, 165, 0, 0.4));
    }
    50% {
      filter: drop-shadow(0 0 25px rgba(255, 215, 0, 0.9))
        drop-shadow(0 0 50px rgba(255, 165, 0, 0.7));
    }
  }

  @media (max-width: 640px) {
    width: 60px;
    height: 60px;
    bottom: 15px;
    right: 15px;
  }
`;

const ButtonContainer = styled.div`
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
`;

const RestartButton = styled.button`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid #000;
  border-radius: 40px;
  cursor: pointer;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;

  &:hover {
    transform: translate(-1px, -1px);
    box-shadow: 5px 5px 0px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translate(0, 0);
    box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 640px) {
    padding: 10px 20px;
    font-size: 14px;
    box-shadow: 3px 3px 0px rgba(0, 0, 0, 0.2);
  }
`;

const FullscreenWarningOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const FullscreenWarningModal = styled.div`
  background: white;
  border: 4px solid #000;
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.4s ease;
  text-align: center;

  @keyframes slideUp {
    from {
      transform: translateY(50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 640px) {
    padding: 20px;
    border-radius: 15px;
  }
`;

const WarningTitle = styled.h2`
  font-size: 28px;
  font-weight: 900;
  color: #d32f2f;
  margin: 0 0 15px 0;
  text-transform: uppercase;
  letter-spacing: 1px;

  @media (max-width: 640px) {
    font-size: 22px;
  }
`;

const WarningMessage = styled.p`
  font-size: 18px;
  font-weight: bold;
  color: #000;
  margin: 0 0 10px 0;
  line-height: 1.4;

  @media (max-width: 640px) {
    font-size: 16px;
  }
`;

const WarningDescription = styled.p`
  font-size: 14px;
  color: #555;
  margin: 0 0 25px 0;
  line-height: 1.6;

  @media (max-width: 640px) {
    font-size: 13px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const ResumeButton = styled.button`
  flex: 0 1 auto;
  min-width: 180px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  border: 2px solid #000;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translate(0, 0);
    box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 640px) {
    min-width: 100%;
    padding: 10px 16px;
    font-size: 14px;
  }
`;

const ExitButton = styled.button`
  flex: 0 1 auto;
  min-width: 180px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #f44336 0%, #da190b 100%);
  border: 2px solid #000;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translate(0, 0);
    box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 640px) {
    min-width: 100%;
    padding: 10px 16px;
    font-size: 14px;
  }
`;

export default FloodGame;
