// 1. 기본 환경 설정
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 배경색 설정
scene.background = new THREE.Color(0xeeeeee); 

// 2. 조명(Lighting) 추가
// 3D 모델을 보기 위해서는 반드시 조명이 필요합니다!
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // 전체적으로 부드러운 빛
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // 특정 방향에서 오는 빛
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// 3. OrbitControls 설정
// 마우스 왼쪽 버튼 드래그로 회전, 휠로 줌인/줌아웃 가능
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.set(0, 5, 10); // 카메라 초기 위치 설정
controls.update();

// 4. OBJ 및 MTL 모델 로드 (핵심)
// 모델 파일(model.obj, model.mtl)이 이 main.js 파일과 같은 위치에 있다고 가정합니다.
const mtlLoader = new THREE.MTLLoader();
mtlLoader.load(
    './model.mtl', // ✨ 경로 수정: 모델 파일 이름을 정확히 입력하세요.
    function (materials) {
        // MTL 파일(재질 정보)을 불러온 후 OBJ 로더에 적용
        materials.preload();
        
        const objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials); // 재질 정보 적용
        objLoader.load(
            './model.obj', // ✨ 경로 수정: 모델 파일 이름을 정확히 입력하세요.
            function (object) {
                // 모델이 너무 크거나 작으면 여기서 크기를 조절합니다.
                // object.scale.set(0.1, 0.1, 0.1); 
                
                // 모델의 중심을 Scene의 중심으로 이동
                object.traverse(function(child) {
                    if (child.isMesh) {
                        child.geometry.computeBoundingBox();
                        const center = new THREE.Vector3();
                        child.geometry.boundingBox.getCenter(center);
                        child.geometry.translate(-center.x, -center.y, -center.z);
                    }
                });

                // 장면(Scene)에 모델 추가
                scene.add(object);
                console.log("3D 모델 로드 완료!");
            },
            // 로딩 중 진행 상황 콜백 함수 (선택 사항)
            function (xhr) {
                console.log(`모델 로드 중: ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
            },
            // 로드 오류 발생 시 콜백 함수
            function (error) {
                console.error('모델 로드 오류 발생:', error);
            }
        );
    },
    // MTL 로딩 중 진행 상황 콜백 함수 (선택 사항)
    undefined,
    // MTL 로드 오류 발생 시 콜백 함수
    function (error) {
        console.error('MTL 로드 오류 발생:', error);
    }
);


// 5. 애니메이션 루프
function animate() {
    requestAnimationFrame(animate);

    // controls.update()를 매 프레임마다 호출하여 마우스 이벤트를 처리합니다.
    controls.update(); 

    renderer.render(scene, camera);
}

animate();

// 창 크기 변경 시 렌더러 크기 및 카메라 종횡비 업데이트
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});