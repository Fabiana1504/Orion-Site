const fs = require('fs');
const path = require('path');
const THREE = require('three');
const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader.js');

const loader = new GLTFLoader();
const buffer = fs.readFileSync(path.join(__dirname, 'public/so26.glb'));
const arrayBuffer = new Uint8Array(buffer).buffer;

loader.parse(arrayBuffer, '', (gltf) => {
  console.log('Scenes:', gltf.scenes.length);
  console.log('Meshes:');
  gltf.scene.traverse((obj) => {
    if (obj.isMesh) {
      const mat = obj.material;
      console.log('  Mesh:', obj.name, 'material:', mat.name || '(no name)');
      if (mat.color) console.log('    color:', mat.color.getHexString());
      if (mat.metalness !== undefined) console.log('    metalness:', mat.metalness);
      if (mat.roughness !== undefined) console.log('    roughness:', mat.roughness);
      if (mat.opacity !== undefined) console.log('    opacity:', mat.opacity);
      if (mat.transparent) console.log('    transparent:', mat.transparent);
      console.log('    vertices:', obj.geometry.attributes.position.count);
    }
  });
  
  const box = new THREE.Box3().setFromObject(gltf.scene);
  console.log('Bounding box:', box.min.toArray(), box.max.toArray());
  
  // Check if any mesh has visible geometry
  let totalVerts = 0;
  gltf.scene.traverse((obj) => {
    if (obj.isMesh && obj.geometry) totalVerts += obj.geometry.attributes.position.count;
  });
  console.log('Total vertices:', totalVerts);
}, (err) => {
  console.error('Error loading GLB:', err);
});
