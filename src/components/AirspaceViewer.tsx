// src/components/AirspaceViewer.tsx

import React ,{ useRef }from 'react';
import { Canvas,useFrame  } from '@react-three/fiber';
import { OrbitControls, Grid, Line, Text } from '@react-three/drei';
import '../static/KeyParameterCalculation.css';
import * as THREE from 'three';

// 添加飞机相关的接口
interface AircraftProps {
    position: [number, number, number];
    rotation?: [number, number, number];
}

// 飞机组件
function Aircraft({ position, rotation = [0, 0, 0] }: AircraftProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const velocityRef = useRef(new THREE.Vector3(1, 0, 0));
    const targetRef = useRef(new THREE.Vector3(...position));

    useFrame(() => {
        if (!meshRef.current) return;

        // 当接近目标点时生成新的目标点
        if (meshRef.current.position.distanceTo(targetRef.current) < 5) {
            targetRef.current = new THREE.Vector3(
                (Math.random() - 0.5) * 1800,  // 在空域范围内随机生成目标点
                200 + Math.random() * 200,     // 高度在200-400米之间
                (Math.random() - 0.5) * 1800
            );
        }

        // 计算方向和新位置
        const direction = new THREE.Vector3().subVectors(targetRef.current, meshRef.current.position).normalize();
        velocityRef.current.lerp(direction.multiplyScalar(5), 0.02);
        meshRef.current.position.add(velocityRef.current);

        // 让飞机朝向运动方向
        meshRef.current.lookAt(meshRef.current.position.clone().add(velocityRef.current));
    });

    return (
        <group>
            {/* 飞机主体 */}
            <mesh ref={meshRef} position={position}>
                <cylinderGeometry args={[0, 2, 8, 8]} />
                <meshStandardMaterial color="red" />
                {/* 机翼 */}
                <group position={[0, 0, 0]}>
                    <mesh position={[0, 0, 4]}>
                        <boxGeometry args={[10, 0.5, 2]} />
                        <meshStandardMaterial color="grey" />
                    </mesh>
                    {/* 尾翼 */}
                    <mesh position={[0, 2, -3]}>
                        <boxGeometry args={[4, 2, 0.5]} />
                        <meshStandardMaterial color="grey" />
                    </mesh>
                </group>
            </mesh>
        </group>
    );
}

interface AirspaceProps {
    airspace: {
        length: number;
        width: number;
        height: number;
    };
    numberOfAircraft?: number; // 添加飞机数量参数
}

// 定义建筑物类型接口
interface BuildingProps {
    position: [number, number, number];
    size: [number, number, number];
    color: string;
    name: string;
}



// 通用建筑物组件
function Building({ position, size, color, name }: BuildingProps) {
    return (
        <group>
            <mesh position={[position[0], position[1] + size[1]/2, position[2]]}>
                <boxGeometry args={size} />
                <meshStandardMaterial 
                    color={color} 
                    transparent 
                    opacity={0.7}
                    side={2}
                />
            </mesh>
            <Text
                position={[position[0], position[1] + size[1] + 20, position[2]]}
                fontSize={30}
                color="#000000"
                anchorX="center"
                anchorY="middle"
                renderOrder={1}
            >
                {name}
            </Text>
        </group>
    );
}

// 定义所有建筑物数据
const buildings: BuildingProps[] = [
    {
        position: [100, 0, 0],  // 教学楼位置
        size: [50, 100, 100], // 长宽高
        color: "#D3D3D3",     // 颜色
        name: "1号教学楼"        // 建筑名称
    },
    {
        position: [200, 0, -100],  // 教学楼位置
        size: [100, 50, 50], // 长宽高
        color: "#D3D3D3",     // 颜色
        name: "3号教学楼"        // 建筑名称
    },
    {
        position: [200, 0, 100],  // 教学楼位置
        size: [100, 50, 50], // 长宽高
        color: "#D3D3D3",     // 颜色
        name: "2号教学楼"        // 建筑名称
    },
    {
        position: [400, 0, 0],  // 教学楼位置
        size: [50, 80, 80], // 长宽高
        color: "#D3D3D3",     // 颜色
        name: "5号教学楼"        // 建筑名称
    },

    {
        position: [400, 0, 200],  // 教学楼位置
        size: [100, 80, 80], // 长宽高
        color: "#D3D3D3",     // 颜色
        name: "4号教学楼"        // 建筑名称
    },
    {
        position: [-500, 0, 0],
        size: [150, 80, 100],
        color: "#B8860B",
        name: "图书馆"
    },
    {
        position: [-500, 0, 200],
        size: [120, 60, 80],
        color: "#8B4513",
        name: "教学楼D1"
    },
    {
        position: [-500, 0, 350],
        size: [120, 60, 80],
        color: "#8B4513",
        name: "教学楼D2"
    },
    {
        position: [-500, 0, 500],
        size: [120, 60, 80],
        color: "#8B4513",
        name: "教学楼D3"
    },
    {
        position: [-500, 0, -250],
        size: [120, 60, 80],
        color: "#8B4513",
        name: "实验楼"
    },
    {
        position: [-500, 0, -400],
        size: [120, 60, 80],
        color: "#8B4513",
        name: "教学楼D2"
    },
    {
        position: [-500, 0, -550],
        size: [120, 60, 80],
        color: "#8B4513",
        name: "教学楼D3"
    },
    {
        position: [-150, 0, 400],
        size: [120, 100, 300],
        color: "#4682B4",
        name: "体育馆"
    },
    {
        position: [100, 0, 500],
        size: [80, 120, 80],
        color: "#2F4F4F",
        name: "学院楼"
    },
    {
        position: [-800, 0, 400],
        size: [100, 120, 500],
        color: "#2F4F4F",
        name: "学院楼"
    }
];

// 空域立方体
function Box() {
    return (
        <mesh position={[0, 250, 0]}>
            <boxGeometry args={[2000, 500, 2000]} />
            <meshStandardMaterial 
                wireframe 
                color="#156289" 
                transparent 
                opacity={0.3}
                side={2} // 双面渲染
            />
        </mesh>
    );
}


// 地面
function Ground() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[2000, 2000]} />
            <meshStandardMaterial 
                color="#90EE90"
                side={2}
            />
        </mesh>
    );
}

// 标注文字组件
function LabelText({ position, rotation = [0, 0, 0], text }: any) {
    return (
        <Text
            position={position}
            rotation={rotation}
            fontSize={50}
            color="#000000"
            anchorX="center"
            anchorY="middle"
            renderOrder={1} // 确保文字始终渲染在最上层
        >
            {text}
        </Text>
    );
}



function Dimensions() {
    return (
        <>
            <LabelText 
                position={[1100, 250, 0]} 
                text="空域长度: 2000m"
            />
            <LabelText 
                position={[0, 600, 0]} 
                text="空域高度: 500m"
            />
            <LabelText 
                position={[0, 250, 1100]} 
                rotation={[0, Math.PI / 2, 0]}
                text="空域宽度: 2000m"
            />
            <LabelText 
                position={[0, 150, 0]} 
                text="教学楼: 100m × 50m × 100m"
            />
        </>
    );
}

const AirspaceViewer: React.FC<AirspaceProps> = ({ airspace, numberOfAircraft }) => {
    // 生成飞机初始位置
    console.log(numberOfAircraft);
    const aircraftPositions = Array.from({ length: numberOfAircraft || 0}, () => ([
        (Math.random() - 0.5) * 1800,
        200 + Math.random() * 200,
        (Math.random() - 0.5) * 1800
    ] as [number, number, number]));
    return (
        <div style={{ width: '100%', height: '100%', minHeight: '700px' }}>
            <Canvas
                camera={{ 
                    position: [1500, 1500, 1500], 
                    fov: 45,
                    near: 1, // 近裁剪面
                    far: 10000 // 远裁剪面
                }}
                style={{ background: '#f0f0f0' }}
                gl={{ 
                    antialias: true,
                    logarithmicDepthBuffer: true // 启用对数深度缓冲
                }}
            >
                {/* 光源 */}
                <ambientLight intensity={0.5} />
                <directionalLight position={[1000, 1000, 1000]} intensity={0.8} />
                <pointLight position={[100, 100, 100]} />
                
                {/* 场景内容 */}
                <Ground />
                {buildings.map((building, index) => (
                    <Building key={index} {...building} />
                ))}
                <Box />
                <Dimensions />
                
                {/* 添加飞机 */}
                {aircraftPositions.map((position, index) => (
                    <Aircraft key={index} position={position} />
                ))}
                {/* 辅助元素 */}
                <Grid
                    args={[2000, 2000]}
                    cellSize={100}
                    cellThickness={0.5}
                    cellColor="#6f6f6f"
                    sectionSize={500}
                    sectionThickness={1}
                    sectionColor="#000000"
                    fadeDistance={4000}
                    fadeStrength={1}
                    followCamera={false}
                    infiniteGrid={true}
                />
                
                <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    rotateSpeed={0.5}
                    maxPolarAngle={Math.PI / 2}
                    minDistance={100} // 最小缩放距离
                    maxDistance={5000} // 最大缩放距离
                />
                
                <axesHelper args={[500]} />
              
            </Canvas>
        </div>
    );
};

export default AirspaceViewer;