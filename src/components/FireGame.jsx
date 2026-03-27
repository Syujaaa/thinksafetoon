import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import gsap from "gsap";

const FireGame = ({
  onBack,
  onScoreIncrement,
  onScoreDecrement,
  score = 0,
}) => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState("intro");
  const [collectedItems, setCollectedItems] = useState([]);
  const [totalHazard, setTotalHazard] = useState(0);
  const [showGameWon, setShowGameWon] = useState(false);
  const [isItemDragging, setIsItemDragging] = useState(false);
  const [showTotalQuiz, setShowTotalQuiz] = useState(false);
  const [totalQuizAnswer, setTotalQuizAnswer] = useState("");
  const [totalQuizError, setTotalQuizError] = useState("");
  const [canFinish, setCanFinish] = useState(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [fullscreenExitReason, setFullscreenExitReason] = useState("");
  const [safeItemAlert, setSafeItemAlert] = useState("");
  const hasCompletionAlertedRef = useRef(false);
  const gamePlayingRef = useRef(false);

  const dragStateRef = useRef({
    isDragging: false,
    draggedItem: null,
    offsetX: 0,
    offsetY: 0,
    pointerId: null,
  });

  const gameStateRef = useRef({
    hazardItems: [],
    collectionBox: { x: 0, y: 0, width: 0, height: 0 },
    trees: [],
    canvasWidth: 0,
    canvasHeight: 0,
    dpr: 1,
    groundLevel: 0,
    skyEndY: 0,
    itemSize: 60,
    imageCache: {}, // Cache untuk preload images
  });

  // Benda berbahaya dengan poin
  const hazardItemsData = [
    {
      id: "cigarette",
      name: "Puntung Rokok",
      emoji: "🚬",
      image: "/components/2/cigarette.png",
      points: 2,
      color: "#D2691E",
      maxCount: 4, // Paling sedikit
    },
    {
      id: "matches",
      name: "Korek Api",
      emoji: "🔥",
      image: "/components/2/matches.png",
      points: 3,
      color: "#FF6347",
      maxCount: 9, // Paling banyak
    },
    {
      id: "fire",
      name: "Api Unggun",
      emoji: "🏕️",
      image: "/components/2/bonfire.png",
      points: 5,
      color: "#FF4500",
      maxCount: 7, // Sedang
    },
  ];

  // Benda yang TIDAK menyebabkan bahaya kebakaran
  const safeItemsData = [
    {
      id: "water",
      name: "Botol Air",
      emoji: "💧",
      color: "#4169E1",
      maxCount: 5,
    },
    {
      id: "tree",
      name: "Pohon Sehat",
      emoji: "🌳",
      color: "#228B22",
      maxCount: 4,
    },
    {
      id: "flower",
      name: "Bunga",
      emoji: "🌸",
      color: "#FF69B4",
      maxCount: 6,
    },
  ];

  const calculateDimensions = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Limit DPR untuk mobile stability - lebih rendah untuk device kecil
    const isMobileScreen = window.innerWidth < 768;
    const dpr = isMobileScreen
      ? Math.min(window.devicePixelRatio || 1, 1.5)
      : Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.visualViewport
      ? window.visualViewport.height
      : window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Reset transform to avoid accumulating scale after resizes.
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    gameStateRef.current.canvasWidth = width;
    gameStateRef.current.canvasHeight = height;
    gameStateRef.current.dpr = dpr;

    // Adaptive ground level based on screen size
    const isMobile = width < 768;
    const skyRatio = isMobile ? 0.5 : 0.55;
    const groundLevel = height * skyRatio;
    const playAreaHeight = height - groundLevel - 80; // Space for collection box

    gameStateRef.current.groundLevel = groundLevel;
    gameStateRef.current.skyEndY = groundLevel;

    // Collection box di bottom center
    const boxWidth = Math.min(width * 0.75, 350);
    gameStateRef.current.collectionBox = {
      x: (width - boxWidth) / 2,
      y: groundLevel + playAreaHeight,
      width: boxWidth,
      height: 80,
    };

    // Item size - more responsive for small screens - diperkecil lebih lagi
    const itemSize = isMobile
      ? Math.max(32, Math.min(40, width * 0.1))
      : Math.max(35, Math.min(48, width * 0.05));
    gameStateRef.current.itemSize = itemSize;
    gameStateRef.current.isMobile = isMobile;

    // Initialize trees
    initializeTrees();
  };

  const initializeTrees = () => {
    const width = gameStateRef.current.canvasWidth;
    const groundLevel = gameStateRef.current.groundLevel;
    const height = gameStateRef.current.canvasHeight;
    const isMobile = gameStateRef.current.isMobile;

    // Tree heights (will be positioned at ground level)
    const maxTreeHeight = Math.max(
      120,
      Math.min(groundLevel * 0.55, height * (isMobile ? 0.34 : 0.4)),
    );

    const trees = [];

    // Tree positions - now positioned with base at ground level
    const treePositions = [
      { x: width * 0.05, height: maxTreeHeight * 0.75, scale: 0.8 },
      { x: width * 0.15, height: maxTreeHeight * 0.82, scale: 0.85 },
      { x: width * 0.25, height: maxTreeHeight * 0.68, scale: 0.7 },
      { x: width * 0.35, height: maxTreeHeight * 0.78, scale: 0.8 },
      { x: width * 0.45, height: maxTreeHeight * 0.72, scale: 0.75 },
      { x: width * 0.55, height: maxTreeHeight * 0.85, scale: 0.88 },
      { x: width * 0.65, height: maxTreeHeight * 0.7, scale: 0.72 },
      { x: width * 0.75, height: maxTreeHeight * 0.8, scale: 0.82 },
      { x: width * 0.85, height: maxTreeHeight * 0.75, scale: 0.78 },
      { x: width * 0.95, height: maxTreeHeight * 0.83, scale: 0.85 },
    ];

    treePositions.forEach((pos) => {
      trees.push({
        x: pos.x,
        y: groundLevel - pos.height + pos.height * 0.2, // Tree extends into ground
        height: pos.height,
        scale: pos.scale,
        trunkWidth: 30 * pos.scale,
        foliageRadius: 60 * pos.scale,
      });
    });

    gameStateRef.current.trees = trees;
  };

  const initializeItems = () => {
    const width = gameStateRef.current.canvasWidth;
    const height = gameStateRef.current.canvasHeight;
    const groundLevel = gameStateRef.current.groundLevel;
    const itemSize = gameStateRef.current.itemSize;
    const boxLeft = gameStateRef.current.collectionBox.x;
    const boxRight =
      gameStateRef.current.collectionBox.x +
      gameStateRef.current.collectionBox.width;
    const boxTop = gameStateRef.current.collectionBox.y;
    const isMobile = gameStateRef.current.isMobile;

    // Keep items fully inside soil (tidak ada yang melebihi tanah).
    // Top of item starts at groundLevel or lower.
    const baseY = groundLevel; // top aligned with ground line (fully below)
    // Untuk mobile, buat lebih dalam agar lebih banyak item yang tersembunyi (lebih bawah)
    const maxBuried = isMobile
      ? Math.max(35, itemSize * 1.8)
      : Math.max(18, itemSize * 1.25);
    const minY = Math.max(baseY, 0);
    // Pastikan item tetap terlihat di layar, tidak tertutup panel bawah / keluar layar.
    const maxVisibleY = Math.min(
      baseY + maxBuried,
      boxTop - itemSize * 0.25,
      height - itemSize,
    );
    // Tingkatkan padding untuk cegah overlap saat banyak item - gunakan untuk grid spacing
    const overlapPad = isMobile ? 36 : 32;

    // Prefer spawning away from collection box area (horizontal lanes).
    const avoidMargin = isMobile ? 16 : 18;
    const leftMax = boxLeft - avoidMargin - itemSize;
    const rightMin = boxRight + avoidMargin;
    const xRanges = [];
    if (leftMax > 0) xRanges.push([0, leftMax]);
    if (rightMin < width - itemSize) xRanges.push([rightMin, width - itemSize]);
    if (xRanges.length === 0) xRanges.push([0, Math.max(0, width - itemSize)]);

    const sampleX = () => {
      const [a, b] = xRanges[Math.floor(Math.random() * xRanges.length)];
      return a + Math.random() * Math.max(0, b - a);
    };

    const items = [];
    let itemId = 0;

    // Grid-based spawn untuk positioning rapi dan tidak timpa
    // Compact spacing untuk mobile agar fit lebih banyak item
    const baseGridSpacing = itemSize + overlapPad * 0.6;
    const gridSpacing = isMobile
      ? Math.ceil(baseGridSpacing * 0.85)
      : baseGridSpacing;
    const colsPerRow = Math.max(2, Math.floor((width - 60) / gridSpacing));
    const gridStartX = isMobile ? width * 0.03 : width * 0.05; // Margin lebih kecil untuk mobile

    let gridRow = 0;
    let gridCol = 0;

    const spawnItemAtGridPosition = (hazardType) => {
      const gridX = gridStartX + gridCol * gridSpacing;
      const gridY = baseY + gridRow * gridSpacing;

      // Cek apakah posisi valid (tidak keluar dari layar)
      if (gridX + itemSize > width - 30) {
        // Pindah ke baris berikutnya
        gridCol = 0;
        gridRow++;
        return spawnItemAtGridPosition(hazardType);
      }

      // Cek apakah Y masih dalam area yang terlihat
      if (gridY > maxVisibleY) {
        return null; // Tidak bisa spawn lagi, terlalu bawah
      }

      const newItem = {
        id: itemId++,
        type: hazardType.id,
        name: hazardType.name,
        emoji: hazardType.emoji,
        points: hazardType.points,
        color: hazardType.color,
        x: gridX,
        y: gridY,
        width: itemSize,
        height: itemSize,
        rotation: 0,
        collected: false,
        opacity: 1,
        scale: 1,
      };

      items.push(newItem);
      gridCol++;
      return newItem;
    };

    // Legacy spawnItem untuk fallback (untuk Api Unggun jika tidak cukup grid space)
    const spawnItem = (hazardType) => {
      let x = 0;
      let y = baseY;
      let attempts = 0;
      let validPosition = false;
      const maxAttempts = isMobile ? 60 : 80;

      while (!validPosition && attempts < maxAttempts) {
        x = sampleX();

        const t = Math.random();
        const depthBias = isMobile ? t * t * t : t * t;
        const buryDepth = (1 - depthBias) * maxBuried;
        y = baseY + buryDepth;
        y = Math.max(minY, Math.min(y, maxVisibleY));

        // Optimized collision detection dengan early exit
        validPosition = true;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (
            x < item.x + item.width + overlapPad &&
            x + itemSize > item.x - overlapPad &&
            y < item.y + item.height + overlapPad &&
            y + itemSize > item.y - overlapPad
          ) {
            validPosition = false;
            break;
          }
        }

        attempts++;
      }

      if (!validPosition) return null;

      const newItem = {
        id: itemId++,
        type: hazardType.id,
        name: hazardType.name,
        emoji: hazardType.emoji,
        points: hazardType.points,
        color: hazardType.color,
        x,
        y,
        width: itemSize,
        height: itemSize,
        rotation: 0,
        collected: false,
        opacity: 1,
        scale: 1,
      };

      items.push(newItem);
      return newItem;
    };

    // Position items grounded dengan grid system - rapi tidak timpa
    // Spawn items dengan round-robin agar distribusi lebih merata
    gridRow = 0;
    gridCol = 0;

    // Hitung desired count untuk setiap hazard type
    const spawnCounts = hazardItemsData.map((hazardType) => {
      const densityFactor = isMobile ? 2.2 : 3;
      return Math.min(
        Math.round(hazardType.maxCount * densityFactor),
        hazardType.maxCount + (isMobile ? 10 : 12),
      );
    });

    // Track spawn progress untuk setiap type
    const spawnProgress = [0, 0, 0];

    // Round-robin spawn - spawn dari setiap type secara bergantian
    let allDone = false;
    while (!allDone) {
      allDone = true;
      for (let typeIdx = 0; typeIdx < hazardItemsData.length; typeIdx++) {
        if (spawnProgress[typeIdx] < spawnCounts[typeIdx]) {
          const hazardType = hazardItemsData[typeIdx];
          const added = spawnItemAtGridPosition(hazardType);
          if (added) {
            spawnProgress[typeIdx]++;
            allDone = false;
          }
        }
      }
    }

    // Ensure at least 1 campfire (api unggun) visible dengan fallback placement
    const fireType = hazardItemsData.find((h) => h.id === "fire");
    if (fireType) {
      let fireCount = items.filter((it) => it.type === "fire").length;
      let attempts = 0;

      // Jika blum ada fire, spawn minimal 1 dengan guaranteed placement
      if (fireCount < 1) {
        // Try 50 attempts dengan collision detection
        attempts = 0;
        while (fireCount < 1 && attempts < 50) {
          const added = spawnItem(fireType);
          if (added) fireCount++;
          attempts++;
        }

        // Fallback: spawn guaranteed placement di kiri atas
        if (fireCount < 1) {
          const fallbackX = width * 0.15; // Kiri area
          const fallbackY = groundLevel + itemSize * 0.5; // Tengah tanah
          const newItem = {
            id: itemId++,
            type: fireType.id,
            name: fireType.name,
            emoji: fireType.emoji,
            points: fireType.points,
            color: fireType.color,
            x: fallbackX,
            y: fallbackY,
            width: itemSize,
            height: itemSize,
            rotation: 0,
            collected: false,
            opacity: 1,
            scale: 1,
          };
          items.push(newItem);
          fireCount++;
        }
      }

      // Tambah 1 lagi untuk total 2 jika perlu
      if (fireCount < 2) {
        attempts = 0;
        while (fireCount < 2 && attempts < 50) {
          const added = spawnItem(fireType);
          if (added) fireCount++;
          attempts++;
        }

        // Fallback: spawn guaranteed placement di kanan atas
        if (fireCount < 2) {
          const fallbackX = width * 0.75; // Kanan area
          const fallbackY = groundLevel + itemSize * 0.5;
          const newItem = {
            id: itemId++,
            type: fireType.id,
            name: fireType.name,
            emoji: fireType.emoji,
            points: fireType.points,
            color: fireType.color,
            x: Math.max(0, Math.min(fallbackX, width - itemSize)),
            y: fallbackY,
            width: itemSize,
            height: itemSize,
            rotation: 0,
            collected: false,
            opacity: 1,
            scale: 1,
          };
          items.push(newItem);
        }
      }
    }

    // Spawn safe items dengan round-robin juga
    const safespawnCounts = safeItemsData.map((safeType) => {
      const densityFactor = isMobile ? 1.6 : 1.8;
      return Math.min(
        Math.round(safeType.maxCount * densityFactor),
        safeType.maxCount + (isMobile ? 7 : 9),
      );
    });

    const safeSpawnProgress = [0, 0, 0];

    const hazardOnlyItems = items.filter((it) => !it.isSafe);
    const trySpawnSafeNearHazard = (baseHazard, safeType) => {
      if (!baseHazard) return null;

      const minDist = itemSize * (isMobile ? 0.9 : 0.8);
      const maxDist = itemSize * (isMobile ? 1.8 : 2.1);
      const maxAttempts = isMobile ? 24 : 32;

      for (let k = 0; k < maxAttempts; k++) {
        const ang = Math.random() * Math.PI * 2;
        const dist = minDist + Math.random() * Math.max(0, maxDist - minDist);
        let x = baseHazard.x + Math.cos(ang) * dist;
        let y = baseHazard.y + Math.sin(ang) * dist;

        // Keep within bounds (and away from collection box lanes already handled by xRanges).
        x = Math.max(0, Math.min(x, width - itemSize));
        y = Math.max(minY, Math.min(y, maxVisibleY));

        // Collision check vs all existing items (hazard + safe) with same pad logic.
        let ok = true;
        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          if (
            x < it.x + it.width + overlapPad &&
            x + itemSize > it.x - overlapPad &&
            y < it.y + it.height + overlapPad &&
            y + itemSize > it.y - overlapPad
          ) {
            ok = false;
            break;
          }
        }
        if (!ok) continue;

        const newItem = {
          id: itemId++,
          type: safeType.id,
          name: safeType.name,
          emoji: safeType.emoji,
          points: 0,
          isSafe: true,
          color: safeType.color,
          x,
          y,
          width: itemSize,
          height: itemSize,
          rotation: 0,
          collected: false,
          opacity: 1,
          scale: 1,
        };
        items.push(newItem);
        return newItem;
      }

      return null;
    };

    let safeAllDone = false;
    while (!safeAllDone) {
      safeAllDone = true;
      for (let typeIdx = 0; typeIdx < safeItemsData.length; typeIdx++) {
        if (safeSpawnProgress[typeIdx] < safespawnCounts[typeIdx]) {
          const safeType = safeItemsData[typeIdx];
          // Prefer spawn safe items dekat benda berbahaya agar user bisa membandingkan.
          // Fallback ke random jika tidak dapat posisi valid.
          const baseHazard =
            hazardOnlyItems.length > 0
              ? hazardOnlyItems[Math.floor(Math.random() * hazardOnlyItems.length)]
              : null;
          const near = trySpawnSafeNearHazard(baseHazard, safeType);

          if (near) {
            safeSpawnProgress[typeIdx]++;
            safeAllDone = false;
            continue;
          }

          // Fallback: spawn random di tanah dengan collision detection.
          let x = sampleX();
          let y = baseY;
          let attempts = 0;
          let validPosition = false;

          while (!validPosition && attempts < 40) {
            x = sampleX();
            const t = Math.random();
            const depthBias = isMobile ? t * t * t : t * t;
            const buryDepth = (1 - depthBias) * maxBuried;
            y = baseY + buryDepth;
            y = Math.max(minY, Math.min(y, maxVisibleY));

            validPosition = true;
            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              if (
                x < item.x + item.width + overlapPad &&
                x + itemSize > item.x - overlapPad &&
                y < item.y + item.height + overlapPad &&
                y + itemSize > item.y - overlapPad
              ) {
                validPosition = false;
                break;
              }
            }
            attempts++;
          }

          if (validPosition) {
            const newItem = {
              id: itemId++,
              type: safeType.id,
              name: safeType.name,
              emoji: safeType.emoji,
              points: 0,
              isSafe: true,
              color: safeType.color,
              x,
              y,
              width: itemSize,
              height: itemSize,
              rotation: 0,
              collected: false,
              opacity: 1,
              scale: 1,
            };
            items.push(newItem);
            safeSpawnProgress[typeIdx]++;
            safeAllDone = false;
          }
        }
      }
    }

    gameStateRef.current.hazardItems = items;
  };

  const snapItemToGround = (item) => {
    if (!item || item.collected) return;

    const groundLevel = gameStateRef.current.groundLevel;
    const itemSize = item.height;
    const height = gameStateRef.current.canvasHeight;
    const boxTop = gameStateRef.current.collectionBox.y;
    const baseY = groundLevel;
    const maxBuried = Math.max(8, itemSize * 0.6);
    const minY = Math.max(baseY, 0);
    const maxY = Math.min(
      baseY + maxBuried,
      boxTop - itemSize * 0.25,
      height - itemSize,
    );
    item.y = Math.max(minY, Math.min(item.y, maxY));
  };

  const drawSky = (ctx) => {
    const width = gameStateRef.current.canvasWidth;
    const skyEndY = gameStateRef.current.skyEndY;

    const skyGradient = ctx.createLinearGradient(0, 0, 0, skyEndY);
    skyGradient.addColorStop(0, "#87CEEB");
    skyGradient.addColorStop(0.7, "#B0E0E6");
    skyGradient.addColorStop(1, "#E0F6FF");

    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, skyEndY);
  };

  const drawGround = (ctx) => {
    const width = gameStateRef.current.canvasWidth;
    const height = gameStateRef.current.canvasHeight;
    const groundLevel = gameStateRef.current.groundLevel;

    // Grass
    const grassGradient = ctx.createLinearGradient(0, groundLevel, 0, height);
    grassGradient.addColorStop(0, "#228B22");
    grassGradient.addColorStop(1, "#1a6b1a");

    ctx.fillStyle = grassGradient;
    ctx.fillRect(0, groundLevel, width, height - groundLevel);

    // Ground line
    ctx.strokeStyle = "#2d5a2d";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundLevel);
    ctx.lineTo(width, groundLevel);
    ctx.stroke();
  };

  const drawTree = (ctx, tree) => {
    // Trunk
    ctx.fillStyle = "#8B4513";
    const trunkTopX = tree.x - tree.trunkWidth / 2;
    ctx.fillRect(
      trunkTopX,
      tree.y + tree.height * 0.7,
      tree.trunkWidth,
      tree.height * 0.3,
    );

    // Foliage (circle)
    ctx.fillStyle = "#228B22";
    ctx.beginPath();
    ctx.arc(
      tree.x,
      tree.y + tree.height * 0.5,
      tree.foliageRadius,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    // Foliage highlight
    ctx.fillStyle = "rgba(144, 238, 144, 0.4)";
    ctx.beginPath();
    ctx.arc(
      tree.x - tree.foliageRadius * 0.3,
      tree.y + tree.height * 0.3,
      tree.foliageRadius * 0.5,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  };

  const drawTrees = (ctx) => {
    gameStateRef.current.trees.forEach((tree) => drawTree(ctx, tree));
  };

  const drawCollectionBox = (ctx) => {
    const box = gameStateRef.current.collectionBox;

    // Background
    ctx.fillStyle = "rgba(255, 200, 0, 0.15)";
    ctx.fillRect(box.x, box.y, box.width, box.height);

    // Border - dashed
    ctx.strokeStyle = "#FF6347";
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    ctx.setLineDash([]);

    // Label
    ctx.fillStyle = "#000";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Kumpulkan Di Sini", box.x + box.width / 2, box.y + 30);
  };

  const drawHazardItems = (ctx) => {
    const viewportPadding = 100; // Buffer untuk culling
    const canvasWidth = gameStateRef.current.canvasWidth;
    const canvasHeight = gameStateRef.current.canvasHeight;

    gameStateRef.current.hazardItems.forEach((item) => {
      if (item.collected) return;

      // Cull items outside viewport untuk optimize rendering
      if (
        item.x + item.width < -viewportPadding ||
        item.x > canvasWidth + viewportPadding ||
        item.y + item.height < -viewportPadding ||
        item.y > canvasHeight + viewportPadding
      ) {
        return; // Skip rendering
      }

      ctx.save();
      ctx.globalAlpha = item.opacity;
      ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
      ctx.rotate((item.rotation * Math.PI) / 180);
      ctx.scale(item.scale, item.scale);

      // Cek apakah image sudah siap
      const img = gameStateRef.current.imageCache[item.type];
      if (img && img.complete) {
        // Gambar image
        ctx.drawImage(
          img,
          -item.width / 2,
          -item.height / 2,
          item.width,
          item.height,
        );
      } else {
        // Fallback: Item box dengan warna + emoji
        ctx.fillStyle = item.color;
        ctx.fillRect(
          -item.width / 2,
          -item.height / 2,
          item.width,
          item.height,
        );

        // Emoji - simpler rendering
        ctx.font = "32px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.emoji, 0, 0);
      }

      // Border dihilangkan

      // Points badge - smaller for mobile (hanya untuk hazard items, bukan safe items)
      if (!item.isSafe) {
        const badgeRadius = gameStateRef.current.isMobile ? 10 : 12;
        const badgeX = item.width / 2 - 10;
        const badgeY = -item.height / 2 + 10;
        ctx.fillStyle = "#FF4500";
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#FFF";
        ctx.font = "bold 9px Arial";
        ctx.fillText(`+${item.points}`, badgeX, badgeY);
      }

      ctx.restore();
    });
  };

  const drawDragPreview = (ctx) => {
    if (!dragStateRef.current.isDragging || !dragStateRef.current.draggedItem)
      return;

    const item = dragStateRef.current.draggedItem;
    ctx.save();
    ctx.globalAlpha = 0.7;

    // Highlight
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 4;
    ctx.strokeRect(item.x - 2, item.y - 2, item.width + 4, item.height + 4);

    // Connection line to collection box
    const box = gameStateRef.current.collectionBox;
    ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(item.x + item.width / 2, item.y + item.height / 2);
    ctx.lineTo(box.x + box.width / 2, box.y + box.height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw in CSS pixel coordinates (consistent for hit-testing on mobile).
    const width = gameStateRef.current.canvasWidth;
    const height = gameStateRef.current.canvasHeight;
    const dpr = gameStateRef.current.dpr || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Clear
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, width, height);

    drawSky(ctx);
    drawGround(ctx);
    drawTrees(ctx);
    drawHazardItems(ctx);
    drawCollectionBox(ctx);
    drawDragPreview(ctx);
  };

  const collectItem = (item) => {
    if (item.collected) return false;

    const box = gameStateRef.current.collectionBox;
    // Seragamkan margin untuk semua device - lebih mudah capture
    const margin = 55;

    const collision =
      item.x < box.x + box.width + margin &&
      item.x + item.width > box.x - margin &&
      item.y < box.y + box.height + margin &&
      item.y + item.height > box.y - margin;

    if (!collision) return false;

    item.collected = true;

    // Animate disappear
    gsap.to(item, {
      opacity: 0,
      scale: 0.5,
      duration: 0.4,
      ease: "back.in",
      onUpdate: () => redrawCanvas(),
    });

    // Jika safe item, tampilkan alert dan jangan tambahkan ke score
    if (item.isSafe) {
      setSafeItemAlert(`"${item.name}" TIDAK menyebabkan kebakaran! 🚫`);
      setTimeout(() => setSafeItemAlert(""), 3000);
      return true;
    }

    // Update state hanya untuk hazard items
    const newCollected = gameStateRef.current.hazardItems.filter(
      (i) => i.collected && !i.isSafe,
    );
    setCollectedItems(newCollected);

    const total = newCollected.reduce((sum, i) => sum + i.points, 0);
    setTotalHazard(total);

    // Minimal 4 untuk boleh selesai, tapi user boleh lanjut kumpulkan.
    if (newCollected.length >= 4) {
      setCanFinish(true);
    }

    // Kalau semua benda berbahaya sudah dikumpulkan, langsung masuk ke hitung total.
    const totalHazardItems = gameStateRef.current.hazardItems.filter(
      (i) => !i.isSafe,
    ).length;
    if (newCollected.length >= totalHazardItems && totalHazardItems > 0) {
      if (!hasCompletionAlertedRef.current) {
        hasCompletionAlertedRef.current = true;
        setTimeout(() => openTotalQuiz(), 300);
      }
    }

    return true;
  };

  const openTotalQuiz = () => {
    setGameState("quiz");
    setShowTotalQuiz(true);
    setTotalQuizAnswer("");
    setTotalQuizError("");
  };

  const isFullscreenActive = () => {
    return (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  };

  const requestFullscreen = async () => {
    const element = document.documentElement;
    try {
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
      console.log("Fullscreen request failed:", error);
    }
  };

  const submitTotalQuiz = () => {
    const answer = Number.parseInt(String(totalQuizAnswer).trim(), 10);
    if (!Number.isFinite(answer)) {
      setTotalQuizError("Masukkan angka yang valid.");
      return;
    }

    if (answer !== totalHazard) {
      setTotalQuizError("Belum tepat. Coba hitung lagi total poin bahaya.");
      if (onScoreDecrement) onScoreDecrement(10);
      return;
    }

    // Score increases 4x the hazard points when correct
    if (onScoreIncrement) onScoreIncrement(totalHazard * 4);

    setTotalQuizError("");
    setShowTotalQuiz(false);
    setGameState("completed");
    setShowGameWon(true);
  };

  const getCanvasPoint = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    // Semua posisi item digambar dalam koordinat CSS pixel (bukan pixel buffer canvas).
    // Karena itu, mapping pointer juga harus menggunakan CSS pixel tanpa dibagi DPR.
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const findItemAtPoint = (x, y) => {
    // Seragamkan touch padding untuk semua item - SAMA SENSITIF
    const touchPadding = 10; // Kecil untuk accurate hit detection
    const item = gameStateRef.current.hazardItems.find(
      (t) =>
        !t.collected &&
        x >= t.x - touchPadding &&
        x <= t.x + t.width + touchPadding &&
        y >= t.y - touchPadding &&
        y <= t.y + t.height + touchPadding,
    );
    return item;
  };

  const handlePointerDown = (e) => {
    if (gameState !== "playing") return;
    // Only one pointer drag at a time.
    if (dragStateRef.current.isDragging) return;

    const { x, y } = getCanvasPoint(e.clientX, e.clientY);
    const item = findItemAtPoint(x, y);
    if (!item) return;

    e.preventDefault();
    canvasRef.current?.setPointerCapture?.(e.pointerId);

    dragStateRef.current.isDragging = true;
    dragStateRef.current.draggedItem = item;
    dragStateRef.current.offsetX = x - item.x;
    dragStateRef.current.offsetY = y - item.y;
    dragStateRef.current.pointerId = e.pointerId;
    setIsItemDragging(true);
    redrawCanvas();
  };

  const handlePointerMove = (e) => {
    if (!dragStateRef.current.isDragging) return;
    if (
      dragStateRef.current.pointerId !== null &&
      e.pointerId !== dragStateRef.current.pointerId
    )
      return;

    e.preventDefault();
    const { x, y } = getCanvasPoint(e.clientX, e.clientY);
    const item = dragStateRef.current.draggedItem;
    if (!item) return;

    item.x = x - dragStateRef.current.offsetX;
    item.y = y - dragStateRef.current.offsetY;

    const width = gameStateRef.current.canvasWidth;
    const height = gameStateRef.current.canvasHeight;
    item.x = Math.max(0, Math.min(item.x, width - item.width));
    item.y = Math.max(0, Math.min(item.y, height - item.height));

    collectItem(item);
    // Throttle redraw untuk mobile - lebih smooth & stabil
    if (
      !dragStateRef.current.lastDrawTime ||
      Date.now() - dragStateRef.current.lastDrawTime > 16
    ) {
      redrawCanvas();
      dragStateRef.current.lastDrawTime = Date.now();
    }
  };

  const endPointerDrag = (e) => {
    if (!dragStateRef.current.isDragging) return;
    if (
      dragStateRef.current.pointerId !== null &&
      e.pointerId !== dragStateRef.current.pointerId
    )
      return;

    e.preventDefault();
    const item = dragStateRef.current.draggedItem;
    if (item && !item.collected) {
      collectItem(item);
      snapItemToGround(item);
    }

    dragStateRef.current.isDragging = false;
    dragStateRef.current.draggedItem = null;
    dragStateRef.current.pointerId = null;
    setIsItemDragging(false);
    redrawCanvas();
  };

  const resetGame = () => {
    hasCompletionAlertedRef.current = false;
    setCollectedItems([]);
    setTotalHazard(0);
    setShowGameWon(false);
    setShowTotalQuiz(false);
    setTotalQuizAnswer("");
    setTotalQuizError("");
    setCanFinish(false);
    setGameState("playing");
    initializeItems();
    redrawCanvas();
  };

  const animationRef = useRef(null);
  const requestDraw = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(() => {
      redrawCanvas();
    });
  };

  useEffect(() => {
    calculateDimensions();
    initializeItems();
    requestDraw();

    // Preload images
    hazardItemsData.forEach((item) => {
      if (item.image) {
        const img = new Image();
        img.src = item.image;
        img.onload = () => {
          gameStateRef.current.imageCache[item.id] = img;
        };
      }
    });

    const handleResize = () => {
      calculateDimensions();
      initializeItems();
      requestDraw();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    if (gameState === "playing") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const pointerOptions = { passive: false };

      canvas.addEventListener("pointerdown", handlePointerDown, pointerOptions);
      canvas.addEventListener("pointermove", handlePointerMove, pointerOptions);
      canvas.addEventListener("pointerup", endPointerDrag, pointerOptions);
      canvas.addEventListener("pointercancel", endPointerDrag, pointerOptions);

      return () => {
        canvas.removeEventListener(
          "pointerdown",
          handlePointerDown,
          pointerOptions,
        );
        canvas.removeEventListener(
          "pointermove",
          handlePointerMove,
          pointerOptions,
        );
        canvas.removeEventListener("pointerup", endPointerDrag, pointerOptions);
        canvas.removeEventListener(
          "pointercancel",
          endPointerDrag,
          pointerOptions,
        );
      };
    }
  }, [gameState]);

  useEffect(() => {
    gamePlayingRef.current = gameState !== "completed";
  }, [gameState]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (
        gamePlayingRef.current &&
        !isFullscreenActive() &&
        gameState !== "completed"
      ) {
        if (onScoreDecrement) {
          onScoreDecrement(15);
        }
        setShowFullscreenWarning(true);
        if (fullscreenExitReason !== "escape") {
          setFullscreenExitReason("fullscreen");
        }
        setTimeout(() => {
          requestFullscreen();
        }, 500);
      }
    };

    const handleVisibilityChange = () => {
      if (
        document.hidden &&
        gamePlayingRef.current &&
        gameState !== "completed"
      ) {
        if (onScoreDecrement) {
          onScoreDecrement(10);
        }
      }
    };

    const handleKeyDown = (e) => {
      if (
        e.key === "Escape" &&
        gamePlayingRef.current &&
        gameState !== "completed" &&
        isFullscreenActive()
      ) {
        setFullscreenExitReason("escape");
      }
    };

    const handleBeforeUnload = (e) => {
      if (gamePlayingRef.current && gameState !== "completed") {
        e.preventDefault();
        e.returnValue = "Anda masih bermain! Yakin ingin keluar?";
        return "Anda masih bermain! Yakin ingin keluar?";
      }
    };

    if (gameState === "completed") {
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
      {gameState === "intro" && (
        <IntroOverlay>
          <IntroModal>
            <IntroTitle>🔥 Bahaya Kebakaran di Hutan 🔥</IntroTitle>
            <IntroDescription>
              <h3>Misi Mu:</h3>
              <p>
                Identifikasi dan kumpulkan benda-benda berbahaya yang dapat
                menyebabkan kebakaran hutan! Kumpulkan minimal 4 benda untuk
                menyelesaikan misi.
              </p>
              <HazardList>
                {hazardItemsData.map((item) => (
                  <HazardItem key={item.id}>
                    <span>{item.emoji}</span>
                    <div>
                      <strong>{item.name}</strong>
                      <p>+{item.points} poin bahaya</p>
                    </div>
                  </HazardItem>
                ))}
              </HazardList>
              <Tips>
                <h4>Cara Bermain:</h4>
                <ul>
                  <li>Drag & drop benda ke area penampungan di bawah</li>
                  <li>Kumpulkan minimal 3 benda berbeda</li>
                  <li>Lihat total skor bahaya saat permainan</li>
                </ul>
              </Tips>
            </IntroDescription>
            <StartButton onClick={() => setGameState("playing")}>
              🎮 MULAI BERMAIN
            </StartButton>
          </IntroModal>
        </IntroOverlay>
      )}

      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          cursor: isItemDragging ? "grabbing" : "grab",
          touchAction: "none",
          userSelect: "none",
          WebkitTapHighlightColor: "transparent",
          width: "100%",
          height: "100%",
        }}
      />

      {gameState === "playing" && (
        <GameUI>
          <InfoPanel>
            <InfoItem>
              <Label>Terkumpul:</Label>
              <Value>{collectedItems.length}</Value>
            </InfoItem>
          </InfoPanel>

          {canFinish && (
            <FinishPanel>
              <FinishButton
                onClick={() => {
                  if (!hasCompletionAlertedRef.current) {
                    hasCompletionAlertedRef.current = true;
                  }
                  openTotalQuiz();
                }}
              >
                ✅ CUKUP
              </FinishButton>
            </FinishPanel>
          )}

          {collectedItems.length > 0 && (
            <CollectionPreview>
              <PreviewTitle>Terkumpul:</PreviewTitle>
              <PreviewItems>
                {collectedItems.map((item, idx) => (
                  <PreviewItem key={idx}>
                    <span>{item.emoji}</span>
                  </PreviewItem>
                ))}
              </PreviewItems>
            </CollectionPreview>
          )}
        </GameUI>
      )}

      {safeItemAlert && (
        <SafeItemAlertBox>
          <SafeItemAlertText>{safeItemAlert}</SafeItemAlertText>
        </SafeItemAlertBox>
      )}

      {showTotalQuiz && (
        <QuizOverlay>
          <QuizModal>
            <QuizTitle>🧮 Hitung Total Bahaya</QuizTitle>
            <QuizText>
              Kamu sudah mengumpulkan minimal 4 benda berbahaya. Sekarang hitung
              total <strong>poin bahaya</strong> dari semua benda yang sudah
              kamu kumpulkan.
            </QuizText>
            <QuizCollectedWrap>
              <QuizCollectedTitle>Benda yang terkumpul:</QuizCollectedTitle>
              <QuizCollectedList>
                {collectedItems.map((item) => (
                  <QuizCollectedItem key={item.id}>
                    <span className="emoji">{item.emoji}</span>
                    <span className="name">{item.name}</span>
                    <span className="points">+{item.points}</span>
                  </QuizCollectedItem>
                ))}
              </QuizCollectedList>
            </QuizCollectedWrap>
            <QuizForm
              onSubmit={(e) => {
                e.preventDefault();
                submitTotalQuiz();
              }}
            >
              <QuizInput
                inputMode="numeric"
                pattern="[0-9]*"
                value={totalQuizAnswer}
                onChange={(e) => {
                  setTotalQuizAnswer(e.target.value);
                  if (totalQuizError) setTotalQuizError("");
                }}
                placeholder="Tulis totalnya (angka)"
                aria-label="Jawaban total poin bahaya"
                autoFocus
              />
              {totalQuizError && <QuizError>{totalQuizError}</QuizError>}
              <QuizButtons>
                <QuizButton type="submit">✅ Konfirmasi</QuizButton>
              </QuizButtons>
            </QuizForm>
          </QuizModal>
        </QuizOverlay>
      )}

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
              Selesaikan permainan terlebih dahulu, kumpulkan 4 benda untuk
              menyelesaikan misi! Anda otomatis dikembalikan ke fullscreen.
            </WarningDescription>
            <ButtonGroup>
              <ResumeButton
                onClick={() => {
                  setShowFullscreenWarning(false);
                  setFullscreenExitReason("");
                  requestFullscreen();
                }}
              >
                ↩️ Kembali Fullscreen
              </ResumeButton>
              <ExitButton
                onClick={() => {
                  setShowFullscreenWarning(false);
                  setFullscreenExitReason("");
                  onBack();
                }}
              >
                ✕ Keluar Permainan
              </ExitButton>
            </ButtonGroup>
          </FullscreenWarningModal>
        </FullscreenWarningOverlay>
      )}

      {showGameWon && (
        <WinOverlay>
          <WinModal>
            <WinTitle>🎉 SELESAI! 🎉</WinTitle>
            <WinMessage>
              <p>Anda berhasil mengidentifikasi benda-benda berbahaya!</p>
              <StatsBox>
                <StatItem>
                  <StatLabel>Total Terkumpul:</StatLabel>
                  <StatValue>{collectedItems.length}</StatValue>
                </StatItem>
                <StatItem>
                  <StatLabel>Total Skor Bahaya:</StatLabel>
                  <StatValue style={{ color: "#FF4500" }}>
                    {totalHazard}
                  </StatValue>
                </StatItem>
              </StatsBox>
              <Conclusion>
                <p>Semua item di atas adalah penyebab utama kebakaran hutan!</p>
                <p>
                  Kita harus menjaga dan mengelola dengan aman agar hutan tetap
                  aman.
                </p>
              </Conclusion>
            </WinMessage>
            <ButtonGroup>
              <RestartButton onClick={resetGame}>🔄 Ulangi</RestartButton>
              <BackButton onClick={onBack}>← Kembali</BackButton>
            </ButtonGroup>
          </WinModal>
        </WinOverlay>
      )}
    </StyledContainer>
  );
};

// Styled Components
const StyledContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #fff;

  canvas {
    display: block;
  }
`;

const IntroOverlay = styled.div`
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

const IntroModal = styled.div`
  background: white;
  border: 4px solid #000;
  border-radius: 20px;
  padding: 40px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
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

const IntroTitle = styled.h1`
  font-size: 32px;
  font-weight: 900;
  color: #ff4500;
  margin: 0 0 30px 0;
  text-transform: uppercase;
`;

const IntroDescription = styled.div`
  text-align: left;
  margin-bottom: 30px;

  h3 {
    font-size: 20px;
    color: #000;
    margin: 20px 0 10px 0;
  }

  p {
    font-size: 16px;
    color: #333;
    margin: 10px 0;
    line-height: 1.6;
  }
`;

const HazardList = styled.div`
  background: #fff8dc;
  border: 2px solid #ff6347;
  border-radius: 10px;
  padding: 15px;
  margin: 20px 0;
`;

const HazardItem = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;

  span:first-child {
    font-size: 28px;
  }

  strong {
    display: block;
    color: #000;
    font-size: 16px;
  }

  p {
    color: #ff4500;
    font-weight: bold;
    margin: 5px 0 0 0;
  }
`;

const Tips = styled.div`
  background: #e8f5e9;
  border: 2px solid #4caf50;
  border-radius: 10px;
  padding: 15px;
  margin: 20px 0;

  h4 {
    margin: 0 0 10px 0;
    color: #2e7d32;
  }

  ul {
    margin: 0;
    padding-left: 20px;

    li {
      margin: 8px 0;
      color: #333;
    }
  }
`;

const StartButton = styled.button`
  padding: 15px 40px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #ff6347 0%, #ff4500 100%);
  border: 3px solid #000;
  border-radius: 40px;
  cursor: pointer;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;

  &:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translate(0, 0);
    box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.3);
  }
`;

const GameUI = styled.div`
  position: fixed;
  top: 20px;
  left: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  pointer-events: none;

  > * {
    pointer-events: auto;
  }

  @media (max-width: 768px) {
    top: 10px;
    left: 10px;
    right: 10px;
    gap: 10px;
  }
`;

const FinishPanel = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.96);
  border: 3px solid #000;
  border-radius: 15px;
  padding: 12px 14px;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    padding: 10px 12px;
    gap: 8px;
  }
`;

const FinishText = styled.div`
  font-size: 12px;
  font-weight: 900;
  color: #111;
  text-transform: uppercase;
  line-height: 1.1;
`;

const FinishButton = styled.button`
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 900;
  color: #fff;
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  border: 2px solid #000;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 3px 3px 0px rgba(0, 0, 0, 0.25);
  transition: all 0.2s ease;

  &:active {
    transform: translate(0, 0);
    box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.25);
  }
`;

const InfoPanel = styled.div`
  display: flex;
  gap: 20px;
  background: rgba(255, 255, 255, 0.96);
  border: 3px solid #000;
  border-radius: 15px;
  padding: 15px 25px;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.2);
  margin-top: 50px;

  @media (max-width: 480px) {
    gap: 12px;
    padding: 10px 12px;
    border-radius: 10px;
  }

  @media (max-width: 768px) {
    gap: 15px;
    padding: 12px 15px;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
`;

const Label = styled.span`
  font-size: 11px;
  font-weight: bold;
  color: #666;
  text-transform: uppercase;

  @media (max-width: 480px) {
    font-size: 9px;
  }
`;

const Value = styled.span`
  font-size: 24px;
  font-weight: 900;
  color: #ff4500;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const CollectionPreview = styled.div`
  background: rgba(255, 255, 255, 0.96);
  border: 3px solid #ffd700;
  border-radius: 15px;
  padding: 15px;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  @media (max-width: 480px) {
    padding: 8px;
    border-radius: 10px;
    border-width: 2px;
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const PreviewTitle = styled.div`
  font-size: 11px;
  font-weight: bold;
  color: #ff4500;
  margin-bottom: 10px;
  text-transform: uppercase;

  @media (max-width: 480px) {
    font-size: 9px;
    margin-bottom: 6px;
  }
`;

const PreviewItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 480px) {
    gap: 5px;
  }
`;

const PreviewItem = styled.div`
  position: relative;
  width: 45px;
  height: 45px;
  background: #ffd700;
  border: 2px solid #000;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.2);

  @media (max-width: 480px) {
    width: 38px;
    height: 38px;
    font-size: 18px;
    border-radius: 6px;
  }

  .points {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #ff4500;
    color: white;
    font-size: 11px;
    font-weight: bold;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid black;
  }
`;

const WinOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
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

const QuizTitle = styled.h2`
  font-size: 28px;
  font-weight: 900;
  color: #111;
  margin: 0 0 12px 0;
`;

const QuizText = styled.p`
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #333;
  line-height: 1.5;
`;

const QuizCollectedWrap = styled.div`
  width: 100%;
  background: #fff8dc;
  border: 2px solid #000;
  border-radius: 14px;
  padding: 12px;
  margin: 0 0 12px 0;
`;

const QuizCollectedTitle = styled.div`
  font-size: 12px;
  font-weight: 900;
  color: #111;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const QuizCollectedList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  @media (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

const QuizCollectedItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 2px solid #000;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.92);

  .emoji {
    font-size: 22px;
    width: 28px;
    text-align: center;
  }

  .name {
    font-size: 14px;
    font-weight: 800;
    color: #111;
    line-height: 1.2;
    flex: 1;
    min-width: 0;
  }

  .points {
    font-size: 12px;
    font-weight: 900;
    color: #fff;
    background: #ff4500;
    border: 2px solid #000;
    border-radius: 999px;
    padding: 4px 8px;
    white-space: nowrap;
  }
`;

const QuizForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const QuizInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  font-size: 18px;
  font-weight: 700;
  border: 3px solid #000;
  border-radius: 14px;
  outline: none;

  &:focus {
    border-color: #ff4500;
  }
`;

const QuizError = styled.div`
  background: #ffe9e6;
  border: 2px solid #ff4500;
  color: #b71c1c;
  padding: 10px 12px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 14px;
`;

const QuizButtons = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const QuizButton = styled.button`
  padding: 12px 22px;
  font-size: 16px;
  font-weight: 900;
  color: #fff;
  background: linear-gradient(135deg, #ff6347 0%, #ff4500 100%);
  border: 2px solid #000;
  border-radius: 40px;
  cursor: pointer;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;

  &:active {
    transform: translate(0, 0);
    box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.3);
  }
`;

const QuizSecondaryButton = styled.button`
  padding: 12px 22px;
  font-size: 16px;
  font-weight: 900;
  color: #111;
  background: #fff;
  border: 2px solid #000;
  border-radius: 40px;
  cursor: pointer;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.18);
  transition: all 0.2s ease;

  &:active {
    transform: translate(0, 0);
    box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.18);
  }
`;

const WinModal = styled.div`
  background: white;
  border: 4px solid #000;
  border-radius: 20px;
  padding: 40px;
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
    padding: 25px;
  }
`;

const QuizOverlay = styled(WinOverlay)`
  background: rgba(0, 0, 0, 0.82);
`;

const QuizModal = styled(WinModal)`
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
`;

const WinTitle = styled.h2`
  font-size: 36px;
  font-weight: 900;
  color: #ff4500;
  margin: 0 0 20px 0;
  text-transform: uppercase;
`;

const WinMessage = styled.div`
  margin-bottom: 30px;

  p {
    font-size: 16px;
    color: #333;
    margin: 10px 0;
    line-height: 1.6;
  }
`;

const StatsBox = styled.div`
  background: #fff8dc;
  border: 2px solid #ff4500;
  border-radius: 15px;
  padding: 20px;
  margin: 20px 0;
`;

const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const StatLabel = styled.span`
  font-size: 14px;
  font-weight: bold;
  color: #333;
`;

const StatValue = styled.span`
  font-size: 28px;
  font-weight: 900;
  color: #ff4500;
`;

const Conclusion = styled.div`
  background: #fce4ec;
  border: 2px solid #e91e63;
  border-radius: 10px;
  padding: 15px;
  margin-top: 20px;

  p {
    font-size: 14px;
    color: #333;
    margin: 8px 0;

    &:first-child {
      font-weight: bold;
      color: #c2185b;
    }
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

const RestartButton = styled.button`
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background: linear-gradient(135deg, #ff6347 0%, #ff4500 100%);
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
`;

const BackButton = styled.button`
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

const SafeItemAlertBox = styled.div`
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 500;
  background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
  border: 3px solid #000;
  border-radius: 15px;
  padding: 15px 25px;
  box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.3);
  animation:
    slideDown 0.4s ease,
    slideUp 0.4s ease 2.6s forwards;

  @keyframes slideDown {
    from {
      transform: translateX(-50%) translateY(-30px);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
    to {
      transform: translateX(-50%) translateY(-30px);
      opacity: 0;
    }
  }

  @media (max-width: 640px) {
    top: 70px;
    padding: 12px 18px;
    border-radius: 12px;
  }
`;

const SafeItemAlertText = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 900;
  color: white;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

export default FireGame;
