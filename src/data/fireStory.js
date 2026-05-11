const fireStory = [
  {
    id: "fire_1",
    background: "/backgrounds/classroom.jpg",
    music: "/music/school.mp3",
    characters: [
      {
        name: "Ren",
        image: "/characters/ren/normal.png",
        position: "right",
        animation: "slide",
      },
    ],
    speaker: "Ren",
    text: "Aku mencium bau asap dari ruang belakang. Apa yang harus kita lakukan?",
    choices: [
      { text: "Cari sumber api sekarang", next: "fire_2" },
      { text: "Abaikan dulu", next: "fire_3" },
    ],
    next: null,
  },
  {
    id: "fire_2",
    background: "/backgrounds/clubroom.jpg",
    music: "/music/club.mp3",
    characters: [
      {
        name: "Ren",
        image: "/characters/ren/smile.png",
        position: "center",
        animation: "fade",
      },
    ],
    speaker: "Ren",
    text: "Kamu menemukan kabel terbakar dan segera mematikan sumber listrik. Keputusan tepat.",
    choices: null,
    next: "fire_4",
  },
  {
    id: "fire_3",
    background: "/backgrounds/clubroom.jpg",
    music: "/music/club.mp3",
    characters: [
      {
        name: "Ren",
        image: "/characters/ren/normal.png",
        position: "center",
        animation: "fade",
      },
    ],
    speaker: "Ren",
    text: "Asap menebal. Kita kehilangan waktu berharga untuk evakuasi.",
    choices: null,
    next: "fire_4",
  },
  {
    id: "fire_4",
    background: "/backgrounds/street.jpg",
    music: "/music/morning.mp3",
    characters: [],
    speaker: "Narrator",
    text: "Tamat sementara. Edit `src/data/fireStory.js` untuk menambah chapter kebakaran.",
    choices: null,
    next: null,
  },
];

export default fireStory;
