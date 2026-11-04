const viewer = document.querySelector("#monza-viewer");

if (viewer) {
  initializeCircuit(viewer);
}

async function initializeCircuit(container) {
  const loadingMessage = container.querySelector(".circuit3d-loading");

  try {
    const [THREE, { OrbitControls }] = await Promise.all([
      import("three"),
      import("three/addons/controls/OrbitControls.js")
    ]);

    createCircuit(container, THREE, OrbitControls);
    loadingMessage.remove();
  } catch (error) {
    console.error("Unable to initialize the Monza 3D circuit.", error);
    loadingMessage.classList.add("is-error");
    loadingMessage.textContent =
      "Il modello 3D non è disponibile. Controlla la connessione e ricarica la pagina.";
  }
}

function createCircuit(container, THREE, OrbitControls) {
  const canvas = container.querySelector(".circuit3d-canvas");
  const infoCard = container.querySelector(".circuit3d-info");
  const legend = container.parentElement.querySelector(".circuit3d-legend");
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#101417");
  scene.fog = new THREE.Fog("#101417", 34, 72);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 160);
  const defaultCameraPosition = new THREE.Vector3(0, 25, 27);
  camera.position.copy(defaultCameraPosition);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = true;
  controls.minDistance = 18;
  controls.maxDistance = 82;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.target.set(0, 0.45, 0);
  controls.update();

  scene.add(new THREE.HemisphereLight("#e2e8ee", "#22292b", 2.1));

  const keyLight = new THREE.DirectionalLight("#ffffff", 3);
  keyLight.position.set(-8, 18, 12);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -23;
  keyLight.shadow.camera.right = 23;
  keyLight.shadow.camera.top = 20;
  keyLight.shadow.camera.bottom = -20;
  scene.add(keyLight);

  const redLight = new THREE.PointLight("#ed2623", 32, 24);
  redLight.position.set(7, 7, -7);
  scene.add(redLight);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(46, 28),
    new THREE.MeshStandardMaterial({
      color: "#26352e",
      roughness: 0.95,
      metalness: 0
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.2, 0);
  ground.receiveShadow = true;
  scene.add(ground);

  const mapScale = 0.034;
  const mapWaypoints = [
    [927, 583], [850, 583], [760, 583], [670, 583], [608, 583],
    [555, 583], [525, 583], [506, 580], [497, 572], [498, 562],
    [506, 555], [514, 550], [518, 542], [514, 536], [507, 540],
    [499, 549], [490, 562], [478, 573], [458, 579], [430, 581],
    [360, 581], [290, 580], [250, 576], [232, 568], [219, 552],
    [211, 530], [205, 495], [198, 450], [190, 405], [183, 360],
    [175, 320], [169, 291], [159, 275], [147, 270], [137, 273],
    [131, 281], [136, 290], [150, 293], [164, 290], [173, 282],
    [169, 267], [163, 245], [157, 215], [151, 180], [146, 148],
    [140, 120], [136, 102], [140, 84], [152, 68], [174, 55],
    [199, 49], [222, 47], [244, 54], [259, 69], [276, 88],
    [300, 116], [330, 153], [362, 190], [395, 228], [428, 266],
    [460, 302], [490, 336], [520, 369], [548, 397], [568, 416],
    [581, 425], [594, 425], [606, 418], [620, 409], [635, 405],
    [650, 406], [664, 411], [675, 420], [683, 433], [697, 442],
    [725, 444], [780, 444], [850, 445], [920, 446], [990, 447],
    [1060, 448], [1110, 451], [1134, 460], [1147, 474], [1155, 491],
    [1156, 509], [1150, 526], [1139, 541], [1122, 552], [1102, 560],
    [1077, 565], [1053, 566], [1028, 565], [1000, 562], [975, 559],
    [950, 557], [927, 555], [927, 570]
  ];
  const centerline = new THREE.CatmullRomCurve3(
    mapWaypoints.map(([x, z], index) => {
      const progress = index / (mapWaypoints.length - 1);
      const elevation = 0.08 + 0.045 * Math.sin(progress * Math.PI * 2);
      return new THREE.Vector3(
        (x - 640) * mapScale,
        elevation,
        (z - 318) * mapScale
      );
    }),
    true,
    "catmullrom",
    0.08
  );

  const trackGroup = new THREE.Group();
  scene.add(trackGroup);

  addRibbon(THREE, trackGroup, centerline, 1.62, 0, 1, 1100, "#686d69", -0.035);
  addRibbon(THREE, trackGroup, centerline, 1.02, 0, 1, 1100, "#25292b", 0.015);
  addTrackEdge(THREE, trackGroup, centerline, 0.52, "#d5d4ce");
  addTrackEdge(THREE, trackGroup, centerline, -0.52, "#d5d4ce");
  addKerbs(THREE, trackGroup, centerline);
  addSectorLines(THREE, trackGroup, centerline, mapScale);
  addStraightModeZones(THREE, trackGroup, centerline, mapScale);
  addTracksideLabels(THREE, trackGroup, centerline, mapScale);
  addTrackMarkers(THREE, trackGroup, centerline, mapScale);
  addStartLine(trackGroup, centerline, THREE);
  addScenery(THREE, scene, centerline);

  const pointsOfInterest = [
    {
      name: "Variante del Rettifilo · 1",
      description: "Prima staccata dopo il rettilineo: inserimento a sinistra della chicane, con cordolo interno e frenata molto profonda.",
      gear: "2ª marcia",
      speed: "circa 80–90 km/h",
      mapPoint: [499, 572],
      color: "#ff544f"
    },
    {
      name: "Variante del Rettifilo · 2",
      description: "Seconda parte della chicane: cambio di direzione verso destra e trazione in uscita sul tratto verso la Curva Grande.",
      gear: "2ª marcia",
      speed: "circa 100–120 km/h",
      mapPoint: [514, 550],
      color: "#ffc857"
    },
    {
      name: "Curva Grande · 3",
      description: "Curva ad arco lungo e ad alta velocità che porta alla staccata della Variante della Roggia.",
      gear: "7ª–8ª marcia",
      speed: "circa 280–300 km/h",
      mapPoint: [219, 552],
      color: "#65d6ad"
    },
    {
      name: "Variante della Roggia · 4",
      description: "Prima svolta della chicane dopo la Curva Grande: frenata decisa e ingresso a sinistra.",
      gear: "2ª–3ª marcia",
      speed: "circa 110–130 km/h",
      mapPoint: [159, 275],
      color: "#71b7ff"
    },
    {
      name: "Variante della Roggia · 5",
      description: "Uscita a destra della chicane: evita il cordolo interno e prepara la sequenza delle Lesmo.",
      gear: "2ª–3ª marcia",
      speed: "circa 120–140 km/h",
      mapPoint: [137, 273],
      color: "#c5a3ff"
    },
    {
      name: "Prima di Lesmo · 6",
      description: "Curva a destra in appoggio: la velocità minima e il posizionamento in uscita condizionano la seconda Lesmo.",
      gear: "4ª marcia",
      speed: "circa 180–200 km/h",
      mapPoint: [140, 102],
      color: "#ff9d5c"
    },
    {
      name: "Seconda di Lesmo · 7",
      description: "Curva a destra più lenta della prima: l'uscita apre sul lungo rettilineo verso la Variante Ascari.",
      gear: "3ª–4ª marcia",
      speed: "circa 160–180 km/h",
      mapPoint: [244, 54],
      color: "#f28acb"
    },
    {
      name: "Variante Ascari · 8",
      description: "Primo cambio di direzione a sinistra nella sequenza Ascari, affrontato ad alta velocità.",
      gear: "4ª–5ª marcia",
      speed: "circa 190–210 km/h",
      mapPoint: [594, 425],
      color: "#f6e96b"
    },
    {
      name: "Variante Ascari · 9",
      description: "Cambio a destra al centro della sequenza: precisione e stabilità sono essenziali per non perdere velocità.",
      gear: "4ª–5ª marcia",
      speed: "circa 180–200 km/h",
      mapPoint: [635, 405],
      color: "#ff9d5c"
    },
    {
      name: "Variante Ascari · 10",
      description: "Ultimo cambio a sinistra della chicane: un'uscita pulita lancia sul rettilineo verso la Parabolica.",
      gear: "4ª–5ª marcia",
      speed: "circa 190–210 km/h",
      mapPoint: [683, 433],
      color: "#9bd66f"
    },
    {
      name: "Curva Alboreto · 11",
      description: "Lunga curva finale, già nota come Parabolica: conserva velocità in percorrenza e massimizza la trazione in uscita.",
      gear: "4ª–5ª marcia",
      speed: "circa 180–220 km/h",
      mapPoint: [1150, 526],
      color: "#f28acb"
    }
  ];

  const markerMeshes = [];
  const markerButtons = [];

  pointsOfInterest.forEach((pointOfInterest, index) => {
    const position = findPointOnCircuit(
      THREE,
      centerline,
      pointOfInterest.mapPoint,
      mapScale
    );
    const marker = createMarker(
      THREE,
      position,
      pointOfInterest.color,
      index + 1
    );
    marker.userData.pointIndex = index;
    markerMeshes.push(marker);
    trackGroup.add(marker);

    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.style.setProperty("--marker-color", pointOfInterest.color);
    button.setAttribute("aria-pressed", "false");
    button.setAttribute(
      "aria-label",
      `${pointOfInterest.name}, ${pointOfInterest.gear}, ${pointOfInterest.speed}`
    );
    button.innerHTML = `<span>${index + 1}</span>${pointOfInterest.name}`;
    button.addEventListener("click", () => selectPoint(index));
    item.append(button);
    legend.append(item);
    markerButtons.push(button);
  });

  const info = {
    kicker: infoCard.querySelector(".circuit3d-info-kicker"),
    name: infoCard.querySelector(".circuit3d-info-name"),
    description: infoCard.querySelector(".circuit3d-info-description"),
    gear: infoCard.querySelector(".circuit3d-info-gear"),
    speed: infoCard.querySelector(".circuit3d-info-speed")
  };

  function selectPoint(index) {
    const pointOfInterest = pointsOfInterest[index];
    if (!pointOfInterest) return;

    info.name.textContent = pointOfInterest.name;
    info.kicker.textContent = `CURVA ${String(index + 1).padStart(2, "0")} · PUNTO DI INTERESSE`;
    info.description.textContent = pointOfInterest.description;
    info.gear.textContent = pointOfInterest.gear;
    info.speed.textContent = pointOfInterest.speed;
    infoCard.classList.add("is-visible");
    markerButtons.forEach((button, buttonIndex) => {
      button.setAttribute("aria-pressed", String(buttonIndex === index));
    });
    markerMeshes.forEach((marker, markerIndex) => {
      marker.scale.setScalar(markerIndex === index ? 1.22 : 1);
    });
  }

  infoCard.querySelector(".circuit3d-close").addEventListener("click", () => {
    infoCard.classList.remove("is-visible");
    markerButtons.forEach((button) => button.setAttribute("aria-pressed", "false"));
    markerMeshes.forEach((marker) => marker.scale.setScalar(1));
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerStart = null;
  let userAdjustedCamera = false;

  canvas.addEventListener("pointerdown", (event) => {
    pointerStart = { x: event.clientX, y: event.clientY };
  });

  canvas.addEventListener("pointerup", (event) => {
    if (!pointerStart) return;
    const moved = Math.hypot(
      event.clientX - pointerStart.x,
      event.clientY - pointerStart.y
    );
    pointerStart = null;
    if (moved > 6) return;

    const bounds = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const [hit] = raycaster.intersectObjects(markerMeshes, true);
    if (hit) selectPoint(hit.object.userData.pointIndex);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (event.buttons !== 0) userAdjustedCamera = true;
    const bounds = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    canvas.style.cursor = raycaster.intersectObjects(markerMeshes, true).length
      ? "pointer"
      : "grab";
  });
  canvas.addEventListener("wheel", () => {
    userAdjustedCamera = true;
  }, { passive: true });

  container.querySelector('[data-camera="top"]').addEventListener("click", () => {
    userAdjustedCamera = true;
    camera.position.set(0, 62, 0);
    controls.target.set(0, 0.45, 0);
    controls.update();
  });

  container
    .querySelector('[data-camera="reset"]')
    .addEventListener("click", () => {
      userAdjustedCamera = false;
      camera.position.copy(defaultCameraPosition);
      controls.target.set(0, 0.45, 0);
      controls.update();
    });

  const resizeObserver = new ResizeObserver(() => {
    const { width, height } = canvas.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    if (!userAdjustedCamera) {
      const distance = width < 500 ? 58 : width < 750 ? 45 : 37;
      defaultCameraPosition.set(0, distance * 0.68, distance * 0.73);
      camera.position.copy(defaultCameraPosition);
      controls.target.set(0, 0.45, 0);
      controls.update();
    }
  });
  resizeObserver.observe(canvas);

  function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}

function addRibbon(THREE, group, curve, width, start, end, samples, color, heightOffset = 0) {
  const positions = [];
  const indices = [];
  const halfWidth = width / 2;

  for (let index = 0; index <= samples; index += 1) {
    const t = start + (end - start) * (index / samples);
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const lateral = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    positions.push(
      point.x + lateral.x * halfWidth,
      point.y + heightOffset,
      point.z + lateral.z * halfWidth,
      point.x - lateral.x * halfWidth,
      point.y + heightOffset,
      point.z - lateral.z * halfWidth
    );

    if (index < samples) {
      const current = index * 2;
      indices.push(current, current + 1, current + 2, current + 1, current + 3, current + 2);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.88,
    metalness: 0.04,
    side: THREE.DoubleSide
  });
  group.add(new THREE.Mesh(geometry, material));
}

function addTrackEdge(THREE, group, curve, offset, color) {
  const points = curve.getPoints(420).map((point, index) => {
    const tangent = curve.getTangent(index / 420);
    const lateral = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    return new THREE.Vector3(
      point.x + lateral.x * offset,
      point.y + 0.025,
      point.z + lateral.z * offset
    );
  });
  const edgeCurve = new THREE.CatmullRomCurve3(points, true);
  const edge = new THREE.Mesh(
    new THREE.TubeGeometry(edgeCurve, 420, 0.025, 5, true),
    new THREE.MeshBasicMaterial({ color })
  );
  group.add(edge);
}

function addKerbs(THREE, group, curve) {
  const geometry = new THREE.BoxGeometry(0.24, 0.07, 0.18);
  const red = new THREE.InstancedMesh(
    geometry,
    new THREE.MeshStandardMaterial({ color: "#e53732", roughness: 0.75 }),
    320
  );
  const white = new THREE.InstancedMesh(
    geometry,
    new THREE.MeshStandardMaterial({ color: "#f1eee8", roughness: 0.75 }),
    320
  );
  const corners = [
    [499, 572], [514, 550], [159, 275], [137, 273],
    [140, 102], [244, 54], [594, 425], [635, 405],
    [683, 433], [1150, 526]
  ];
  const dummy = new THREE.Object3D();
  let redCount = 0;
  let whiteCount = 0;

  corners.forEach((corner, cornerIndex) => {
    const center = findProgressOnCircuit(curve, corner, 0.034);
    const start = center - 0.0065;
    const end = center + 0.0065;
    const steps = cornerIndex === 2 || cornerIndex === 3 ? 10 : 14;
    for (let step = 0; step < steps; step += 1) {
      const t = start + ((end - start) * step) / steps;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const lateral = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const angle = Math.atan2(-tangent.z, tangent.x);

      [-1, 1].forEach((side, sideIndex) => {
        dummy.position.set(
          point.x + lateral.x * 0.62 * side,
          point.y + 0.07,
          point.z + lateral.z * 0.62 * side
        );
        dummy.rotation.set(0, angle, 0);
        dummy.updateMatrix();

        if ((step + sideIndex) % 2 === 0) {
          red.setMatrixAt(redCount, dummy.matrix);
          redCount += 1;
        } else {
          white.setMatrixAt(whiteCount, dummy.matrix);
          whiteCount += 1;
        }
      });
    }
  });

  red.count = redCount;
  white.count = whiteCount;
  red.castShadow = true;
  white.castShadow = true;
  red.instanceMatrix.needsUpdate = true;
  white.instanceMatrix.needsUpdate = true;
  group.add(red, white);
}

function findProgressOnCircuit(curve, mapPoint, mapScale) {
  const targetX = (mapPoint[0] - 640) * mapScale;
  const targetZ = (mapPoint[1] - 318) * mapScale;
  let closestProgress = 0;
  let closestDistance = Infinity;

  for (let sample = 0; sample <= 1800; sample += 1) {
    const progress = sample / 1800;
    const point = curve.getPointAt(progress);
    const distance = (point.x - targetX) ** 2 + (point.z - targetZ) ** 2;
    if (distance < closestDistance) {
      closestDistance = distance;
      closestProgress = progress;
    }
  }
  return closestProgress;
}

function findPointOnCircuit(THREE, curve, mapPoint, mapScale) {
  const point = curve.getPointAt(findProgressOnCircuit(curve, mapPoint, mapScale));
  return new THREE.Vector3(point.x, point.y + 0.04, point.z);
}

function addSectorLines(THREE, group, curve, mapScale) {
  const sectorStarts = [
    0,
    findProgressOnCircuit(curve, [137, 273], mapScale),
    findProgressOnCircuit(curve, [594, 425], mapScale)
  ];
  const sectorEnds = [
    sectorStarts[1],
    sectorStarts[2],
    1
  ];
  const colors = ["#e72f91", "#e3c33d", "#31a6df"];

  colors.forEach((color, index) => {
    addRibbon(
      THREE,
      group,
      curve,
      0.095,
      sectorStarts[index],
      sectorEnds[index],
      360,
      color,
      0.075
    );
  });
}

function addStraightModeZones(THREE, group, curve, mapScale) {
  addDashedRoadsideLine(
    THREE,
    group,
    curve,
    findProgressOnCircuit(curve, [300, 116], mapScale),
    findProgressOnCircuit(curve, [548, 397], mapScale),
    1.12,
    "#ed3434"
  );
}

function addDashedRoadsideLine(THREE, group, curve, start, end, offset, color) {
  const geometry = new THREE.BoxGeometry(0.055, 0.035, 0.12);
  const material = new THREE.MeshBasicMaterial({ color });
  const dashes = new THREE.InstancedMesh(geometry, material, 180);
  const dummy = new THREE.Object3D();
  const distance = end >= start ? end - start : 1 - start + end;
  const count = Math.max(8, Math.floor(distance * 600));

  for (let index = 0; index < count; index += 1) {
    const progress = (start + (distance * index) / count) % 1;
    const point = curve.getPointAt(progress);
    const tangent = curve.getTangentAt(progress);
    const lateral = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    dummy.position.set(
      point.x + lateral.x * offset,
      point.y + 0.12,
      point.z + lateral.z * offset
    );
    dummy.rotation.set(0, Math.atan2(-tangent.z, tangent.x), 0);
    dummy.updateMatrix();
    dashes.setMatrixAt(index, dummy.matrix);
  }
  dashes.count = count;
  dashes.instanceMatrix.needsUpdate = true;
  group.add(dashes);
}

function addTracksideLabels(THREE, group, curve, mapScale) {
  [
    { text: "SETTORE 1", point: [400, 581], color: "#e72f91" },
    { text: "SETTORE 2", point: [180, 51], color: "#e3c33d" },
    { text: "SETTORE 3", point: [920, 446], color: "#31a6df" },
    { text: "STRAIGHT MODE ZONE", point: [405, 224], color: "#ed3434" }
  ].forEach(({ text, point, color }) => {
    const progress = findProgressOnCircuit(curve, point, mapScale);
    const position = curve.getPointAt(progress);
    const tangent = curve.getTangentAt(progress);
    const lateral = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    position.addScaledVector(lateral, 1.2);
    position.y += 0.9;
    const label = createTextSprite(THREE, text, color);
    label.position.copy(position);
    group.add(label);
  });
}

function createTextSprite(THREE, text, accent) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  context.fillStyle = "rgba(12, 14, 16, 0.86)";
  context.beginPath();
  context.roundRect(8, 8, 496, 112, 18);
  context.fill();
  context.fillStyle = accent;
  context.fillRect(8, 8, 10, 112);
  context.fillStyle = "#f4f3f0";
  context.font = "700 43px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 264, 66);

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(canvas),
      transparent: true,
      depthTest: false
    })
  );
  sprite.scale.set(2.7, 0.68, 1);
  return sprite;
}

function addTrackMarkers(THREE, group, curve, mapScale) {
  const markers = [
    { text: "SPEED TRAP", point: [608, 583], color: "#f3d54e" },
    { text: "DETECTION", point: [1110, 451], color: "#53d6a1" },
    { text: "ACTIVATION", point: [1150, 526], color: "#53d6a1" }
  ];

  markers.forEach(({ text, point, color }) => {
    const position = findPointOnCircuit(THREE, curve, point, mapScale);
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.78, 8),
      new THREE.MeshBasicMaterial({ color })
    );
    pole.position.set(position.x, position.y + 0.39, position.z);
    group.add(pole);
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 14, 10),
      new THREE.MeshBasicMaterial({ color })
    );
    beacon.position.set(position.x, position.y + 0.84, position.z);
    group.add(beacon);
    const label = createTextSprite(THREE, text, color);
    label.position.set(position.x, position.y + 1.55, position.z);
    group.add(label);
  });
}

function addScenery(THREE, scene, curve) {
  const treeGeometry = new THREE.ConeGeometry(0.43, 1.5, 7);
  const trunkGeometry = new THREE.CylinderGeometry(0.09, 0.14, 0.55, 6);
  const treeMaterial = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    emissive: "#183423",
    emissiveIntensity: 0.28,
    roughness: 0.92
  });
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: "#493b2c",
    roughness: 1
  });
  const trees = new THREE.InstancedMesh(treeGeometry, treeMaterial, 150);
  const trunks = new THREE.InstancedMesh(trunkGeometry, trunkMaterial, 150);
  const dummy = new THREE.Object3D();
  const path = curve.getPoints(260);
  const treePositions = [];
  let seed = 41;
  let count = 0;
  let attempts = 0;

  function random() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }

  while (count < 150 && attempts < 1400) {
    attempts += 1;
    const treeX = -22 + random() * 44;
    const treeZ = -13 + random() * 26;
    const nearTrack = path.some(
      (point) => Math.hypot(point.x - treeX, point.z - treeZ) < 1.9
    );
    const tooClose = treePositions.some(
      ([x, z]) => Math.hypot(x - treeX, z - treeZ) < 1.45
    );
    if (nearTrack || tooClose) continue;

    treePositions.push([treeX, treeZ]);
    const height = 0.8 + random() * 0.8;
    dummy.position.set(treeX, height * 0.5 - 0.2, treeZ);
    dummy.scale.set(0.82 + random() * 0.45, height / 1.5, 0.82 + random() * 0.45);
    dummy.rotation.set(0, random() * Math.PI, 0);
    dummy.updateMatrix();
    trees.setMatrixAt(count, dummy.matrix);
    trees.setColorAt(
      count,
      new THREE.Color(["#78a070", "#659267", "#8aa574"][Math.floor(random() * 3)])
    );

    dummy.position.y = -0.2 + 0.275 * dummy.scale.y;
    dummy.scale.set(1, dummy.scale.y, 1);
    dummy.updateMatrix();
    trunks.setMatrixAt(count, dummy.matrix);
    count += 1;
  }

  trees.count = count;
  trunks.count = count;
  trees.castShadow = true;
  trunks.castShadow = true;
  scene.add(trees, trunks);

  const garageMaterial = new THREE.MeshStandardMaterial({
    color: "#626a69",
    roughness: 0.82
  });
  const roofMaterial = new THREE.MeshStandardMaterial({
    color: "#808785",
    roughness: 0.7
  });
  addBuilding(THREE, scene, [4.1, 0.43, 10.15], [6.4, 0.9, 0.9], garageMaterial);
  addBuilding(THREE, scene, [4.1, 0.93, 10.15], [6.55, 0.12, 0.98], roofMaterial);

  const grandstandMaterial = new THREE.MeshStandardMaterial({
    color: "#50585b",
    roughness: 0.88
  });
  for (let row = 0; row < 4; row += 1) {
    addBuilding(
      THREE,
      scene,
      [-5.2, 0.1 + row * 0.19, 10.4 - row * 0.32],
      [3.8, 0.18, 0.3],
      grandstandMaterial
    );
  }
}

function addBuilding(THREE, scene, position, dimensions, material) {
  const building = new THREE.Mesh(
    new THREE.BoxGeometry(...dimensions),
    material
  );
  building.position.set(...position);
  building.castShadow = true;
  building.receiveShadow = true;
  scene.add(building);
}

function addStartLine(group, curve, THREE) {
  const point = curve.getPointAt(0.99);
  const tangent = curve.getTangentAt(0.99);
  const angle = Math.atan2(tangent.z, tangent.x);
  const line = new THREE.Group();
  line.position.set(point.x, point.y + 0.035, point.z);
  line.rotation.y = -angle;

  for (let index = 0; index < 10; index += 1) {
    const square = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.018, 0.24),
      new THREE.MeshBasicMaterial({
        color: index % 2 === 0 ? "#f5f4ef" : "#202124"
      })
    );
    square.position.set((index - 4.5) * 0.14, 0, 0);
    line.add(square);
  }
  group.add(line);
}

function createMarker(THREE, position, color, number) {
  const marker = new THREE.Group();
  marker.position.copy(position);

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.035, 0.48, 8),
    new THREE.MeshBasicMaterial({ color })
  );
  stem.position.y = 0.24;
  marker.add(stem);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.23, 20, 16),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.35,
      roughness: 0.3
    })
  );
  sphere.position.y = 0.58;
  sphere.userData.pointIndex = number - 1;
  marker.add(sphere);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.03, 6, 24),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.75 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.05;
  marker.add(ring);

  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 96;
  labelCanvas.height = 96;
  const context = labelCanvas.getContext("2d");
  context.fillStyle = color;
  context.beginPath();
  context.arc(48, 48, 42, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#101214";
  context.font = "700 42px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(String(number), 48, 50);

  const label = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(labelCanvas),
      transparent: true,
      depthTest: false
    })
  );
  label.position.y = 1.05;
  label.scale.set(0.68, 0.68, 1);
  marker.add(label);

  marker.traverse((object) => {
    if (object.isMesh) {
      object.userData.pointIndex = number - 1;
    }
  });
  return marker;
}
