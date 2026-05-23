/** Misma orientación y encuadre que Fabiana: sin rotación ni espejo (solo EXIF del archivo). */
const photoLikeFabi = {
  rotateDeg: 0,
  objectPosition: "50% 28%",
  thumbPosition: "50% 30%",
  scale: 1.22,
};

/** Sin rotación. Scale más bajo = foto más “alejada” en el marco. */
const photoRotLeft90 = {
  ...photoLikeFabi,
  rotateDeg: 0,
  objectPosition: "50% 50%",
  thumbPosition: "50% 50%",
  scale: 1.45,
  thumbScale: 1.5,
};

/** Departamentos: sin giro. */
const departmentPhotoRotLeft90 = {
  rotateDeg: 0,
  scale: photoRotLeft90.scale,
  objectPosition: photoRotLeft90.objectPosition,
};

export const departments = [
  {
    name: "Engineering",
    description:
      "Research, testing, technical development, and design decisions focused on performance and precision.",
    images: ["/departments/engineering-1.jpg"],
    photo: { ...departmentPhotoRotLeft90 },
  },
  {
    name: "Social Media",
    description:
      "Brand identity, digital storytelling, visual communication, and audience presence for Orion.",
    images: ["/departments/social-1.jpg"],
    photo: { ...departmentPhotoRotLeft90 },
  },
];

export const teamMembers = [
  {
    name: "Fabiana Rojas",
    role: "Data analyst and team leader",
    area: "Leadership",
    image: "/orions/Fabiana.jpg",
    bio: "organizes ideas and guides the team to achieve great results.",
    photo: { ...photoLikeFabi },
  },
  {
    name: "Ariel",
    role: "Visual identity designer",
    area: "Design",
    image: "/orions/Ariel.jpg",
    bio: "gives life and visual personality to the brand.",
    photo: { ...photoLikeFabi },
  },
  {
    name: "Heather",
    role: "Sponsorship management",
    area: "Operations",
    image: "/orions/Heather.jpg",
    bio: "builds connections and takes care of relationships with sponsors.",
    photo: { ...photoLikeFabi },
  },
  {
    name: "Aurora",
    role: "Design and manufacturing engineer",
    area: "Engineering",
    image: "/orions/Aurora.png",
    bio: "creates the livery and brings the car design to life.",
    photo: { ...photoLikeFabi },
  },
  {
    name: "Estefanía",
    role: "Livery car designer",
    area: "Engineering",
    image: "/orions/Estefanía.jpg",
    bio: "designs unique and eye-catching styles for the cars.",
    photo: { ...photoLikeFabi },
  },
  {
    name: "Fiorella",
    role: "Social media designer",
    area: "Design",
    image: "/orions/Fiorella.jpg",
    bio: "creates beautiful and creative posts for social media.",
    photo: { ...photoLikeFabi },
  },
];
