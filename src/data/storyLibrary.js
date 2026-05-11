import story from "./story";
import floodStory from "./floodStory";
import fireStory from "./fireStory";

const storyLibrary = [
  {
    id: "intro",
    title: "Pembukaan Cerita",
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

export const getStoryById = (id) => {
  return storyLibrary.find((item) => item.id === id) ?? null;
};

export default storyLibrary;
