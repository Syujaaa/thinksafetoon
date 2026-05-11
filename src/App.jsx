import { useState } from "react";
import VNEngine from "./components/VNEngine";
import Menu from "./pages/Menu";
import { getStoryById } from "./data/storyLibrary";

function App() {
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentArcId, setCurrentArcId] = useState(null);
  const [startSceneId, setStartSceneId] = useState(null);

  const handleChangeStory = (arcId, sceneId) => {
    console.log(
      "[App] handleChangeStory called with arcId:",
      arcId,
      "sceneId:",
      sceneId,
    );
    const newStory = getStoryById(arcId);
    console.log(
      "[App] getStoryById result:",
      newStory ? { id: newStory.id, scenes: newStory.data.length } : null,
    );
    if (newStory) {
      setCurrentArcId(arcId);
      setSelectedStory(newStory);
      setStartSceneId(sceneId);
      console.log("[App] Story changed to arc:", arcId);
    } else {
      console.warn("[App] Story not found for arcId:", arcId);
    }
  };

  if (selectedStory?.data) {
    return (
      <VNEngine
        storyData={selectedStory.data}
        startSceneId={startSceneId}
        onExit={() => {
          setSelectedStory(null);
          setCurrentArcId(null);
          setStartSceneId(null);
        }}
        onChangeStory={handleChangeStory}
      />
    );
  }

  return <Menu onSelectStory={setSelectedStory} />;
}

export default App;
