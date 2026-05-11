const floodStory = [
  {
    id: "flood_1",
    background: "/backgrounds/city-river.jpg",
    music: "/music/school.mp3",
    characters: [
      {
        name: "Nara",
        image: "/characters/ayaka/normal.png",
        position: "left",
        animation: "slide",
      },
    ],
    speaker: "Nara",
    text: "Saluran air kota mulai tersumbat sampah. Kita harus bertindak cepat.",
    choices: [
      { text: "Ajak warga bersih-bersih", next: "flood_2" },
      { text: "Tunggu petugas saja", next: "flood_3" },
    ],
    next: null,
  },
  {
    id: "flood_2",
    background: "/backgrounds/street.jpg",
    music: "/music/morning.mp3",
    characters: [
      {
        name: "Nara",
        image: "/characters/ayaka/happy.png",
        position: "center",
        animation: "fade",
      },
    ],
    speaker: "Nara",
    text: "Kerja sama warga membuat aliran air kembali lancar. Risiko banjir menurun.",
    choices: null,
    next: "flood_4",
  },
  {
    id: "flood_3",
    background: "/backgrounds/street.jpg",
    music: "/music/morning.mp3",
    characters: [
      {
        name: "Nara",
        image: "/characters/ayaka/normal.png",
        position: "center",
        animation: "fade",
      },
    ],
    speaker: "Nara",
    text: "Hujan datang lebih cepat. Air meluap karena saluran masih tersumbat.",
    choices: null,
    next: "flood_4",
  },
  {
    id: "flood_4",
    background: "/backgrounds/clubroom.jpg",
    music: "/music/club.mp3",
    characters: [],
    speaker: "Narrator",
    text: "Tamat sementara. Edit `src/data/floodStory.js` untuk menambah chapter banjir.",
    choices: null,
    next: null,
  },
];

export default floodStory;
