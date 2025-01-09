import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const locations = {
  LubanWorkShop: {
    preview: '/images/workshop.jpg',
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
    preview: '/images/smart_table.jpg',
    scenes: [
      '/images/SmartTable/scene1.jpg',
      '/images/SmartTable/scene2.jpg',
      '/images/SmartTable/scene3.jpg',
    ],
  },
};

const App = () => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [buttons, setButtons] = useState([]);
  const [isVR, setIsVR] = useState(false); // Добавляем состояние для VR режима

  const handleBackToLocationSelection = () => {
    setSelectedLocation(null);
    setCurrentSceneIndex(0);
  };

  const handleExitVR = () => {
    const session = rendererRef.current.xr.getSession();
    if (session) {
      session.end().then(() => {
        console.log('Exited VR session');
      }).catch((err) => {
        console.error('Error exiting VR session:', err);
      });
    }
  };

  const loadScene = (scene, index) => {
    if (!locations[selectedLocation] || !locations[selectedLocation].scenes) {
      console.error('No scenes available for the selected location.');
      return;
    }

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(
      locations[selectedLocation].scenes[index],
      () => console.log('Texture loaded successfully'),
      undefined,
      (err) => console.error('Error loading texture:', err)
    );

    const sphereGeometry = new THREE.SphereGeometry(500, 60, 40);
    const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
    scene.add(sphere);
  };

  useEffect(() => {
    if (!selectedLocation) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    rendererRef.current = renderer;

    if (mountRef.current) {
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(renderer.domElement);

      // Добавляем проверку для VR только в случае, если поддерживается WebXR
      if ('xr' in navigator) {
        navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
          if (supported) {
            setIsVR(true); // Устанавливаем флаг для VR
            document.body.appendChild(VRButton.createButton(renderer)); // Добавляем VR кнопку
          } else {
            console.error('WebXR не поддерживается на этом устройстве.');
            alert('Ваш браузер или устройство не поддерживает VR.');
          }
        });
      }
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 1);
    cameraRef.current = camera;
    sceneRef.current = scene;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;

    loadScene(scene, currentSceneIndex);

    // Создаем кнопки
    const buttonGeometry = new THREE.PlaneGeometry(0.5, 0.2);
    const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const button1 = new THREE.Mesh(buttonGeometry, buttonMaterial);
    const button2 = new THREE.Mesh(buttonGeometry, buttonMaterial);
    const button3 = new THREE.Mesh(buttonGeometry, buttonMaterial);

    button1.position.set(0, 1, -1); // Переключение сцены
    button2.position.set(0, 0.5, -1); // Вернуться на главную
    button3.position.set(0, 0, -1); // Выход из VR

    scene.add(button1);
    scene.add(button2);
    scene.add(button3);

    const buttonText1 = createText('Следующая сцена');
    const buttonText2 = createText('Главная страница');
    const buttonText3 = createText('Выйти из VR');

    button1.add(buttonText1);
    button2.add(buttonText2);
    button3.add(buttonText3);

    setButtons([button1, button2, button3]); // Сохраняем кнопки в состоянии

    // Обработчик взаимодействия с кнопками
    const handleControllerInput = (controller) => {
      if (controller) {
        const intersectedObjects = getIntersectedObjects(controller);

        // Выбираем кнопку, если она была наведена
        if (intersectedObjects.length > 0) {
          const selectedButton = intersectedObjects[0].object;

          if (selectedButton === button1) {
            if (currentSceneIndex < locations[selectedLocation].scenes.length - 1) {
              setCurrentSceneIndex((prev) => prev + 1);
            } else {
              setCurrentSceneIndex(0);
            }
            loadScene(scene, currentSceneIndex);
          } else if (selectedButton === button2) {
            handleBackToLocationSelection();
          } else if (selectedButton === button3) {
            handleExitVR();
          }
        }
      }
    };

    // Обработчик контроллеров
    const controller1 = renderer.xr.getController(0);
    const controller2 = renderer.xr.getController(1);
    scene.add(controller1);
    scene.add(controller2);

    controller1.addEventListener('selectstart', () => handleControllerInput(controller1));
    controller2.addEventListener('selectstart', () => handleControllerInput(controller2));

    // Анимация
    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      if (renderer) renderer.setAnimationLoop(null);
      if (mountRef.current) mountRef.current.innerHTML = '';
    };
  }, [selectedLocation, currentSceneIndex]);

  const createText = (text) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(text, 10, 30);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    material.transparent = true;

    const geometry = new THREE.PlaneGeometry(0.5, 0.2);
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  };

  const getIntersectedObjects = (controller) => {
    // Используем raycaster для того, чтобы определить, на какую кнопку мы смотрим
    const raycaster = new THREE.Raycaster();
    const controllerPosition = controller.position;
    raycaster.ray.origin.set(controllerPosition.x, controllerPosition.y, controllerPosition.z);

    const intersects = raycaster.intersectObjects(buttons); // Используем состояние кнопок
    return intersects;
  };

  // Добавляем обработчик клавиш для стрелок
  const handleKeyDown = (event) => {
    if (!locations[selectedLocation]) return;

    if (event.key === 'ArrowRight') {
      if (currentSceneIndex < locations[selectedLocation].scenes.length - 1) {
        setCurrentSceneIndex((prev) => prev + 1);
      }
    } else if (event.key === 'ArrowLeft') {
      if (currentSceneIndex > 0) {
        setCurrentSceneIndex((prev) => prev - 1);
      }
    }
    loadScene(sceneRef.current, currentSceneIndex);
  };

  window.addEventListener('keydown', handleKeyDown);

  if (!selectedLocation) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        {Object.keys(locations).map((locationKey) => (
          <div
            key={locationKey}
            style={{ margin: '0 20px', cursor: 'pointer' }}
            onClick={() => {
              setSelectedLocation(locationKey);
              setCurrentSceneIndex(0);
            }}
          >
            <img
              src={locations[locationKey].preview}
              alt={locationKey}
              style={{ width: '300px', height: '200px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <p style={{ textAlign: 'center', marginTop: '10px' }}>{locationKey}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      <div ref={mountRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
    </div>
  );
};

export default App;