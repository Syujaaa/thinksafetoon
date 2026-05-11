import { useState } from "react";
import VNEngine from "./components/VNEngine";
import Menu from "./pages/Menu";

function App() {
  const [selectedStory, setSelectedStory] = useState(null);

  if (selectedStory?.data) {
    return (
      <VNEngine
        storyData={selectedStory.data}
        onExit={() => {
          setSelectedStory(null);
        }}
      />
    );
  }

  return <Menu onSelectStory={setSelectedStory} />;
}

export default App;
