import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './App.css'; // Подключение CSS

// Локации
const locations = {
  LubanWorkShop: {
    preview: '/images/workshop.jpg', // Превью изображения для выбора локации
    name: 'Luban Workshop',
    nameColor: '#00937C', // Единый цвет для всех названий
    scenes: [
      '/images/LubanWorkShop/scene1.jpg',
      '/images/LubanWorkShop/scene2.jpg',
      '/images/LubanWorkShop/scene3.jpg',
      '/images/LubanWorkShop/scene4.jpg',
      '/images/LubanWorkShop/scene5.jpg',
      '/images/LubanWorkShop/scene6.jpg',
    ],
  },
  SmartTable: {
    preview: '/images/smart_table.jpg', // Превью изображения для выбора локации
    name: 'Smart Table',
    nameColor: '#00937C', // Единый цвет для всех названий
    scenes: [
      '/images/SmartTable/scene1.jpg',
      '/images/SmartTable/scene2.jpg',
      '/images/SmartTable/scene3.jpg',
    ],
  },
};

// Конфигурация хотспотов
const hotspotsConfig = {
  '/images/LubanWorkShop/scene1.jpg': [
    {
      position: { x: 430.64357085469436, y: -241.80491734900653, z: 72.03418535710743 },
      targetScene: '/images/LubanWorkShop/scene2.jpg'
    },
    {
      position: { x: 83.37750309165891, y: -94.759400219294, z: -482.78217094551775 },
      targetScene: '/images/LubanWorkShop/scene4.jpg'
    }
  ],
  '/images/LubanWorkShop/scene2.jpg': [
    {
      position: { x: 46.06586895318034, y: -206.86717765088292, z: 452.3682196095423 },
      targetScene: '/images/LubanWorkShop/scene1.jpg'
    },
    {
      position: { x: -409.225759391228, y: -172.8185495656979, z: -227.9960985324707 },
      targetScene: '/images/LubanWorkShop/scene3.jpg'
    }
  ],
  '/images/LubanWorkShop/scene3.jpg': [
    {
      position: { x: 303.96223242190604, y: -208.0596096173605, z: 337.53946143087416 },
      targetScene: '/images/LubanWorkShop/scene2.jpg'
    },
  ],
  '/images/LubanWorkShop/scene4.jpg': [
    {
      position: { x: 106.90695570321445, y: -90.45982273121771, z: -479.40114535946054 },
      targetScene: '/images/LubanWorkShop/scene1.jpg'
    },
    {
      position: { x: 17.052445643033327, y: -137.27116044917145, z: 479.4960172452177 },
      targetScene: '/images/LubanWorkShop/scene5.jpg'
    }
  ],
  '/images/LubanWorkShop/scene5.jpg': [
    {
      position: { x: 51.47406292860751, y: -158.90758280385057, z: -471.00239436563413 },
      targetScene: '/images/LubanWorkShop/scene4.jpg'
    },
    {
      position: { x: -122.37595621932472, y: -55.1765398427934, z: 480.59328131125403 },
      targetScene: '/images/LubanWorkShop/scene6.jpg'
    }
  ],
  '/images/LubanWorkShop/scene6.jpg': [
    {
      position: { x: 406.53677389728466, y: -89.04864342798658, z: 275.53183972765953 },
      targetScene: '/images/LubanWorkShop/scene1.jpg'
    }
  ],
  // SMART TABLE
  '/images/SmartTable/scene1.jpg': [
    {
      position: { x: -486.300820098868, y: -64.25691419343899, z: 92.71469920708007 },
      targetScene: '/images/SmartTable/scene2.jpg'
    }
  ],
  '/images/SmartTable/scene2.jpg': [
    {
      position: { x: 485.72178564171776, y: -115.37823446242115, z: -13.940733439969529 },
      targetScene: '/images/SmartTable/scene1.jpg'
    },
    {
      position: { x: -474.57066291547403, y: -126.65771770286817, z: -89.44711690934238 },
      targetScene: '/images/SmartTable/scene3.jpg'
    }
  ],
  '/images/SmartTable/scene3.jpg': [
    {
      position: { x: -496.7492058929257, y: -28.674503450477612, z: -40.53166713467151 },
      targetScene: '/images/SmartTable/scene2.jpg'
    }
  ]
};

// Функция для создания стрелки (Конус, повёрнутый вниз)
function createHotspotMesh({ x, y, z }, targetScene) {
  // Создаём группу для ориентации
  const orientationGroup = new THREE.Group();
  
  // Создаём группу для анимации (подпрыгивания)
  const animationGroup = new THREE.Group();
  orientationGroup.add(animationGroup);
  
  // Создаём конус
  const geometry = new THREE.ConeGeometry(15, 30, 32); // Увеличены радиус основания до 15 и высота до 30
  const material = new THREE.MeshStandardMaterial({ 
    color: '#00937C', 
    side: THREE.DoubleSide, 
    emissive: '#00937C', 
    emissiveIntensity: 0.3 
  }); // Используем MeshStandardMaterial для освещения и эмиссии
  const cone = new THREE.Mesh(geometry, material);
  
  // Поворачиваем конус вниз
  cone.rotation.x = Math.PI; // 180 градусов по оси X
  
  // Позиционируем конус так, чтобы его база была на (0,0,0)
  cone.position.y = 15; // Поскольку высота 30, база на y=0
  
  // Добавляем конус в animationGroup
  animationGroup.add(cone);
  
  // Позиционируем orientationGroup немного внутри сферы радиусом 500
  const vector = new THREE.Vector3(x, y, z).normalize().multiplyScalar(499); // 500 -1
  orientationGroup.position.copy(vector);
  
  // Ориентируем orientationGroup лицом к центру
  orientationGroup.lookAt(new THREE.Vector3(0, 0, 0));
  
  // Добавляем пользовательские данные на конус
  cone.userData = { isHotspot: true, targetScene: targetScene };
  
  return orientationGroup;
}

const App = () => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

  // Refs для Three.js объектов
  const sphereRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);

  // Группа для хотспотов
  const hotspotGroupRef = useRef(new THREE.Group());

  // Список текущих наведённых хотспотов
  const hoveredHotspots = useRef(new Set());

  // Функция возврата к выбору локации
  const handleBackToLocationSelection = () => {
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    if (mountRef.current) {
      mountRef.current.innerHTML = '';
    }
    setSelectedLocation(null);
    setCurrentSceneIndex(0);
    // Очистка группы хотспотов
    hotspotGroupRef.current.clear();
  };

  useEffect(() => {
    if (!selectedLocation) return;

    // Создаём сцену и камеру
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 1);
    cameraRef.current = camera;

    // Создаём рендерер
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current = renderer;

    // Включаем тени в рендерере
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Добавляем рендерер в DOM
    if (mountRef.current) {
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);
    }

    // Добавляем группу хотспотов в сцену
    scene.add(hotspotGroupRef.current);

    // Добавляем освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Загрузка панорамы
    const textureLoader = new THREE.TextureLoader();
    let currentSphere = null;

    const loadScene = (index) => {
      const pathToScene = locations[selectedLocation].scenes[index];
      const texture = textureLoader.load(
        pathToScene,
        () => console.log(`Сцена ${index + 1} загружена`),
        undefined,
        (err) => console.error('Ошибка загрузки текстуры:', err)
      );

      const sphereGeom = new THREE.SphereGeometry(500, 60, 40);
      const sphereMat = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
      });
      const sphere = new THREE.Mesh(sphereGeom, sphereMat);

      // Удаляем старую сферу
      if (currentSphere) {
        if (currentSphere.material.map) {
          currentSphere.material.map.dispose();
        }
        currentSphere.material.dispose();
        currentSphere.geometry.dispose();
        scene.remove(currentSphere);
      }
      currentSphere = sphere;
      sphereRef.current = sphere;
      scene.add(sphere);

      // Очистка предыдущих хотспотов
      hotspotGroupRef.current.clear();

      // Создаём хотспоты для текущей сцены
      const hotspots = hotspotsConfig[pathToScene] || [];
      hotspots.forEach((h) => {
        const hotspot = createHotspotMesh(h.position, h.targetScene);
        hotspotGroupRef.current.add(hotspot);
      });
    };

    loadScene(currentSceneIndex);

    // Настраиваем OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;

    // Создаём Clock для анимации
    const clock = new THREE.Clock();

    // Анимационный цикл
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();

      const elapsed = clock.getElapsedTime();

      // Вращаем конус внутри группы и анимируем подпрыгивание
      hotspotGroupRef.current.children.forEach((orientationGroup) => {
        const animationGroup = orientationGroup.children[0];
        const cone = animationGroup.children[0];

        // Вращение конуса
        cone.rotation.y += 0.02; // Плавное вращение

        // Анимация подпрыгивания при наведении
        if (hoveredHotspots.current.has(cone)) {
          // Амплитуда и частота подпрыгивания
          const amplitude = 5; // Уменьшена амплитуда для остаточного изображения
          const frequency = 3;

          // Вычисляем смещение по Y
          const offset = amplitude * Math.sin(frequency * elapsed);
          animationGroup.position.y = offset;
        } else {
          // Возвращаемся в исходное положение
          animationGroup.position.y = 0;
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Обработчик изменения размера окна
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);

    // Raycaster для обработки кликов и наведений
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Проверяем пересечения только с хотспотами (конусами)
      const intersects = raycaster.intersectObjects(
        hotspotGroupRef.current.children.flatMap(child => child.children),
        true
      );

      // Создаём новый набор наведённых хотспотов
      const newHovered = new Set();

      intersects.forEach(intersect => {
        const obj = intersect.object;
        if (obj.userData.isHotspot) {
          newHovered.add(obj);
        }
      });

      // Обновляем hoveredHotspots
      hoveredHotspots.current = newHovered;
    };

    const handlePointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Проверяем пересечения только с хотспотами (конусами)
      const intersects = raycaster.intersectObjects(
        hotspotGroupRef.current.children.flatMap(child => child.children),
        true
      );
      if (intersects.length > 0) {
        const obj = intersects[0].object;

        if (obj.userData.isHotspot) {
          console.log(`Нажат хотспот: ${obj.userData.targetScene}`); // Для отладки
          const targetScene = obj.userData.targetScene;
          const idx = locations[selectedLocation].scenes.indexOf(targetScene);
          if (idx >= 0) {
            setCurrentSceneIndex(idx);
          } else {
            console.warn(`Целевая сцена ${targetScene} не найдена в массиве сцен.`);
          }
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    // Очистка при размонтировании компонента или смене сцены
    return () => {
      window.removeEventListener('resize', onWindowResize);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);

      if (currentSphere) {
        if (currentSphere.material.map) currentSphere.material.map.dispose();
        currentSphere.material.dispose();
        currentSphere.geometry.dispose();
        scene.remove(currentSphere);
        currentSphere = null;
      }

      // Очистка хотспотов
      hotspotGroupRef.current.clear();

      renderer.dispose();
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, [selectedLocation, currentSceneIndex]);

  // Выбор локации
  if (!selectedLocation) {
    return (
      <div className="app-container">
        {/* Navbar */}
        <nav className="navbar">
          <div className="navbar-content">
            {/* EKTU Logo */}
            <div className="navbar-logo">
              <img src="/images/EKTULogo.png" alt="EKTU Logo" className="logo-image" />
            </div>
            {/* Luban Logo */}
            <div className="navbar-logo">
              <img src="/images/LubanLogo1.png" alt="Luban Logo" className="logo-image" />
            </div>
          </div>
        </nav>

        {/* Страница выбора локации */}
        <div className="location-selection">
          {Object.keys(locations).map((locationKey) => (
            <div
              key={locationKey}
              className="location-card"
              onClick={() => {
                setSelectedLocation(locationKey);
                setCurrentSceneIndex(0);
              }}
            >
              <img
                src={locations[locationKey].preview}
                alt={locations[locationKey].name}
                className="location-logo"
              />
              <p className="location-name">
                {locations[locationKey].name}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Панорама
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Canvas */}
      <div
        ref={mountRef}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Кнопка "Вернуться к выбору локации" */}
      <div
        style={{
          pointerEvents: 'none', // Позволяет взаимодействовать с дочерними элементами
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        <div
          style={{
            pointerEvents: 'auto',
            position: 'absolute',
            top: '20px',
            left: '20px',
          }}
        >
          <button
            onClick={handleBackToLocationSelection}
            className="back-button"
          >
            Вернуться к выбору локации
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;