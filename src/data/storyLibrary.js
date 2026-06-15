import story from "./story";
import floodStory from "./floodStory";
import fireStory from "./fireStory";

const storyLibrary = [
  {
    id: "intro",
    title: "Komik Interaktif",
    data: story,
  },
  {
    id: "flood",
    title: "Banjir karena Sampah",
    data: floodStory,
  },
  {
    id: "fire",
    title: "Kesadaran Bahaya Kebakaran",
    data: fireStory,
  },
];

console.log("[storyLibrary] Initialized:", {
  arcs: storyLibrary.map((arc) => ({ id: arc.id, scenes: arc.data.length })),
});

export const getStoryById = (id) => {
  return storyLibrary.find((item) => item.id === id) ?? null;
};

// Fungsi untuk memproses transisi ke story lain
export const resolveStoryTransition = (next) => {
  if (!next) return null;

  // Cek apakah next adalah transisi ke story arc lain
  // Format: @@NEXT_STORY:fire_1_transition
  if (next.startsWith("@@NEXT_STORY:")) {
    const sceneId = next.replace("@@NEXT_STORY:", "");
    const arcMatch = sceneId.match(/^([a-z]+)_/);
    const arcName = arcMatch ? arcMatch[1] : null;

    return {
      sceneId,
      arcName,
      isArcTransition: true,
    };
  }

  return {
    sceneId: next,
    isArcTransition: false,
  };
};

// Fungsi untuk mencari scene dari semua story libraries
export const findSceneInLibrary = (sceneId) => {
  console.log("[findSceneInLibrary] Searching for scene:", sceneId);
  for (const storyItem of storyLibrary) {
    console.log(
      "[findSceneInLibrary] Searching in arc:",
      storyItem.id,
      "total scenes:",
      storyItem.data.length,
    );
    const found = storyItem.data.find((scene) => scene.id === sceneId);
    if (found) {
      console.log("[findSceneInLibrary] Found in arc:", storyItem.id);
      return { scene: found, arcId: storyItem.id };
    }
  }
  console.warn("[findSceneInLibrary] Scene not found:", sceneId);
  return { scene: null, arcId: null };
};

export default storyLibrary;
