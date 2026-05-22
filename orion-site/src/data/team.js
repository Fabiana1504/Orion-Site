/** Misma orientación y encuadre que Fabiana: sin rotación ni espejo (solo EXIF del archivo). */
const photoLikeFabi = {
  rotateDeg: 0,
  objectPosition: "50% 28%",
  thumbPosition: "50% 30%",
  scale: 1.22,
};

/** -90° = 90° hacia la izquierda (antihorario). Scale más bajo = foto más “alejada” en el marco. */
const photoRotLeft90 = {
  ...photoLikeFabi,
  rotateDeg: -90,
  objectPosition: "50% 50%",
  thumbPosition: "50% 50%",
  scale: 1.45,
  thumbScale: 1.5,
};

/** Departamentos: mismo giro que Fiorella / Estefanía. */
const departmentPhotoRotLeft90 = {
  rotateDeg: photoRotLeft90.rotateDeg,
  scale: photoRotLeft90.scale,
  objectPosition: photoRotLeft90.objectPosition,
};

export const departments = [
  {
    name: "Engineering",
    description:
      "Research, testing, technical development, and design decisions focused on performance and precision.",
    images: ["/images/departments/engineering-1.jpg"],
    photo: { ...departmentPhotoRotLeft90 },
  },
  {
    name: "Social Media",
    description:
      "Brand identity, digital storytelling, visual communication, and audience presence for Orion.",
    images: ["/images/departments/social-1.jpg"],
    photo: { ...departmentPhotoRotLeft90 },
  },
];

export const teamMembers = [
  {
    name: "Fabiana Rojas",
    role: "Team Leader / Project Manager",
    area: "Leadership",
    image: "/images/team/fabi.jpg",
    bio: "Leads coordination, direction, planning, and overall team vision for Orion.",
    photo: { ...photoLikeFabi },
  },
  {
    name: "Ariel",
    role: "Design",
    area: "Design",
    image: "/images/team/ariel.jpg",
    bio: "Contributes to visual development and creative identity across the team.",
    photo: { ...photoLikeFabi },
  },
  {
    name: "Fiorella",
    role: "Design",
    area: "Design",
    image: "/images/team/fiorella.jpg",
    bio: "Supports design execution and visual presentation materials.",
    photo: { ...photoRotLeft90 },
  },
  {
    name: "Heather",
    role: "Manufacturing / Sponsorship",
    area: "Operations",
    image: "/images/team/heather.jpg",
    bio: "Supports manufacturing work and sponsorship-related materials.",
    photo: { ...photoLikeFabi },
  },
  {
    name: "Estefanía",
    role: "Car Design / Manufacturing",
    area: "Engineering",
    image: "/images/team/estefania.jpg",
    bio: "Works on vehicle development, design contribution, and manufacturing tasks.",
    photo: { ...photoRotLeft90 },
  },
];
