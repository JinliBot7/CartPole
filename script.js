//#region
import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import * as CANNON from 'cannon-es'

import Stats from 'stats.js'

import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { Mesh } from 'three'
import * as math from "mathjs"
const sin = Math.sin
const cos = Math.cos
var pi = Math.PI



//$endregion



/**
 * Debug
 */
const gui = new dat.GUI()
const debugObject = {}


/**
 * Objects
 */
const cart = {}
const pole = {}
const F = 0 // input force
//#region
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// FPS indicator
const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

// Scene
const scene = new THREE.Scene()
scene.background = new THREE.Color( 0xeeeeee)

// Fonts





//#endregion

const ratio = 2


//Joint
const joint_geometry_0 = new THREE.BoxGeometry( 0.3*ratio, 0.3*ratio, 0.3*ratio )
const joint_color_0 = new THREE.Color(0xdc143c)
const joint_material_0 = new THREE.MeshStandardMaterial( { color: joint_color_0 } )
joint_material_0.metalness = 0      
joint_material_0.roughness = 1
joint_material_0.emissiveIntensity = 0
const joint_mesh_0 = new THREE.Mesh( joint_geometry_0, joint_material_0 )
scene.add( joint_mesh_0 )
joint_mesh_0.position.y = 0
joint_mesh_0.position.z = 0
joint_mesh_0.position.x = 0*ratio
joint_mesh_0.rotation.x = 0
scene.add( joint_mesh_0 )

//Cart
const cart_geometry = new THREE.BoxGeometry( 1*ratio, 1*ratio, 2*ratio )
cart.color = new THREE.Color(0xaed6f1)
const cart_material = new THREE.MeshStandardMaterial( { color: cart['color'] } )
cart_material.metalness = 0      
cart_material.roughness = 1
cart_material.emissiveIntensity = 0
const cart_mesh = new THREE.Mesh( cart_geometry, cart_material )
cart_mesh.position.y = 0
cart_mesh.position.z = 0
cart_mesh.position.x = 5*ratio
scene.add( cart_mesh )
joint_mesh_0.add(cart_mesh)




cart.p = 0
cart.pe = 0
cart.pe1 = 0
cart.v = 0
cart.a = 0
cart.m = 1

const transformP = (value) =>
{
    if (value>10 )
    {
        value = value -20
    }
    else if (value<-10)
    {
        value = value + 20
    }
    return value
}


const transformA = (value) =>
{
    if (value>Math.PI)
    {
        value = value -2*Math.PI
    }
    else if (value<-Math.PI)
    {
        value = value + 2*Math.PI
    }
    return value
}
//Joint
const joint_geometry = new THREE.BoxGeometry( 0.3*ratio, 0.3*ratio, 0.3*ratio )
const joint_color = new THREE.Color(0xdc143c)
const joint_material = new THREE.MeshStandardMaterial( { color: joint_color} )
joint_material.metalness = 0      
joint_material.roughness = 1
joint_material.emissiveIntensity = 0
const joint_mesh = new THREE.Mesh( joint_geometry, joint_material )
scene.add( joint_mesh )
cart_mesh.add(joint_mesh)
joint_mesh.position.y = 0
joint_mesh.position.z = 0
joint_mesh.position.x = 0.65*ratio
joint_mesh.rotation.x = Math.PI



// debugObject.theta = 0
// const theta = (value) =>
// {
//     joint_mesh.rotation.x = value/180*Math.PI,0,0

// }
// const control_folder = gui.addFolder( 'Controls' )
// control_folder.add(debugObject,'theta').min(-180).max(180).step(0.01).name('Rotation').onChange(theta).listen()


//Pole
pole.angleVelocity = 0
const pole_geometry = new THREE.CylinderGeometry( 0.1*ratio, 0.1*ratio, 3*ratio, 64)
pole.color = new THREE.Color(0x000000)
const pole_material = new THREE.MeshStandardMaterial( { color: pole['color'] } )
const pole_mesh = new THREE.Mesh( pole_geometry, pole_material )
scene.add( pole_mesh )
joint_mesh.add(pole_mesh)
pole_mesh.position.y = -1.5*ratio
pole_mesh.position.z = 0
pole_mesh.position.x = 0

pole.p = 0
pole.pe = 0
pole.v = 0
pole.a = 0
pole.m = 1



const g = 10
const L = 1

const M = cart.m
const m = pole.m

var boundValue = 10 
var initialEnergy = 0
const Motion = (timeInterval) =>
{   
    timeInterval =timeInterval
    console.log(energyShapingCheckFlag)
    const computeU = getControlInput()
    var u = 0
    const theta = pole.p    

    if (energyShapingCheckFlag == false)
    {
        if (controlFlag ==false)
        {   
            u = 0
            cart.a = (u + m*cos(theta)*sin(theta)*g - m*L*sin(theta)*Math.pow(pole.v,2))/(M+m-m*Math.pow(cos(theta),2))-Math.sign(cart.v)*0.5
            pole.a = (u*cos(theta)+ (M+m)*g*sin(theta) -m*L*sin(theta)*cos(theta)*Math.pow(pole.v,2)) /((M+m-m*Math.pow(cos(theta),2))*L)-Math.sign(pole.v)*0.5
        }
        else
        {
            u = Math.max(Math.min(computeU,boundValue),-boundValue)

            cart.a = (u + m*cos(theta)*sin(theta)*g - m*L*sin(theta)*Math.pow(pole.v,2))/(M+m-m*Math.pow(cos(theta),2))

            pole.a = (u*cos(theta)+ (M+m)*g*sin(theta) -m*L*sin(theta)*cos(theta)*Math.pow(pole.v,2)) /((M+m-m*Math.pow(cos(theta),2))*L)
        }
    }

    else    
    {   
        if (cos(pole.p)>cos(30/180*Math.PI))
        {   
            u = Math.max(Math.min(computeU,boundValue),-boundValue)

            cart.a = (u + m*cos(theta)*sin(theta)*g - m*L*sin(theta)*Math.pow(pole.v,2))/(M+m-m*Math.pow(cos(theta),2))

            pole.a = (u*cos(theta)+ (M+m)*g*sin(theta) -m*L*sin(theta)*cos(theta)*Math.pow(pole.v,2)) /((M+m-m*Math.pow(cos(theta),2))*L)
            changeText('Pole Placement')
            
        }

        else
        {
            

            cart.a = energyShapingControl()
            pole.a = g*sin(pole.p)/L+cos(pole.p)/L*cart.a
            changeText('Energy Shaping')
        }
        
    }
    
    updateState()
    debugObject.controlForce = Math.round(u*100)/100

    //timeInterval = timeInterval*0.1
    
    

    // cart.a = (u + m*cos(theta)*sin(theta)*g - m*L*sin(theta)*Math.pow(pole.v,2))/(M+m-m*Math.pow(cos(theta),2))

    // pole.a = (u*cos(theta)+ (M+m)*g*sin(theta) -m*L*sin(theta)*cos(theta)*Math.pow(pole.v,2)) /((M+m-m*Math.pow(cos(theta),2))*L)

    // const eq1 = (M+m)*cart.a +m*L*sin(theta)*(pole.v)**2 - m*L*cos(theta)*pole.a
    // const eq2 = L*pole.a - cos(theta)*cart.a - g*sin(theta)
 
    
    cart.p = cart.p + cart.v*timeInterval + 0.5*cart.a*Math.pow(timeInterval,2)
    pole.p = pole.p + pole.v*timeInterval + 0.5*pole.a*Math.pow(timeInterval,2)

    cart.pe = transformP(cart.p%20)

    debugObject.cartPosition = (Math.round(cart.pe*1000)/1000)

    pole.pe = transformA(pole.p%(2*Math.PI))
    
    debugObject.poleAngle = Math.round(pole.pe/Math.PI*180*1000)/1000

    cart.v = cart.v+  cart.a*timeInterval
    pole.v = pole.v + pole.a*timeInterval
    
    //const currentEnergy = 0.5*m*pole.v**2



    // cart.a = (u+cos(pole.p)*sin(pole.p)*g-sin(pole.p)*pole.v**2)/(1+sin(pole.p)**2)
    // pole.a = g*sin(pole.p)+cos(pole.p)*cart.a


    





    //cart_mesh.position.z = -cart.p
    joint_mesh_0.rotation.y = cart.p/10*Math.PI
    joint_mesh.rotation.x = Math.PI + pole.p

    
}


debugObject.k1 = -0.1071    
debugObject.k2 = -0.52875
debugObject.k3 = 28.7031
debugObject.k4 = 5.63875

const getControlInput = () =>
{   
    const k1 = debugObject.k1
    const k2 = debugObject.k2
    const k3 = debugObject.k3
    const k4 = debugObject.k4

    const Amatrix = math.matrix([[0,1,0,0], [0, 0,m*g/M,0], [0,0,0,1], [0,0,(m*g+M*g)/(m*L),0]])
    const Bmatirx = math.matrix([[0],[1/M],[0],[1/M]])
    const Kmatrix = math.matrix([[k1,k2,k3,k4]])
    const Tmatrix = math.subtract(Amatrix, math.multiply(Bmatirx,Kmatrix))
    //const ans = math.eigs(Tmatrix)

    

    const errorMatrix = math.matrix([[debugObject.targetX-cart.p],[debugObject.targetXDot-cart.v],[debugObject.targetTheta-pole.pe],[debugObject.targetThetaDot-pole.v]])
    const u = math.multiply(Kmatrix,errorMatrix)._data[0][0]
    return u 
}


const targetEnergy = m*g*L 
const energyShapingControl = () =>
{
    const E = m*g*L*cos(pole.p)  + 0.5*m*pole.v*pole.v
    const Eerorr = E-targetEnergy
    const cartA = -0.5*pole.v*cos(pole.p)*Eerorr
    return cartA   
}

//getControlInput()

// var controFlag = false
// debugObject.control = () =>
// {
//     controFlag = true
// }
// control_folder.add(debugObject,'control').name('control')


// debugObject.reset = () =>
// {   

// }

//control_folder.add(debugObject,'reset').name('reset')
//#region

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const fontLoader = new FontLoader()
fontLoader.load(
    './fonts/helvetiker_regular.typeface.json',
    (font) =>
    {   
        function addFont(textContent,x,y,z,xRotation,yRotation,zRotation,size,color,name)
        {
            const textGeometry = new TextGeometry(
                textContent,
                {
                    font: font,
                    size: size,
                    height: 0.0,    
                    curveSegments: 12,
                    bevelEnabled: false,
                    bevelThickness: 0.01,
                    bevelSize: 0.01,
                    bevelOffset: 0,
                    bevelSegments: 5
                }
            )
            const textMaterial = new THREE.MeshBasicMaterial({color:color})
            textMaterial.metalness = 1
            textMaterial.roughness = 0.2
            const text = new THREE.Mesh(textGeometry, textMaterial)
            text.name = name
            textGeometry.center()
            text.rotation.x = xRotation
            text.rotation.y = yRotation
            text.rotation.z = zRotation
                
            text.position.set(x,y,z)
            scene.add(text)


        }
    addFont('PolyU Virtual Lab',0,12,0,0,Math.PI/2,0,1,0x000000,'PolyU') 
    addFont('CartPole Control',0,10,0,0,Math.PI/2,0,0.9,0x000000,'CartPole Control')
    addFont('Free Drop',0,8,0,0,Math.PI/2,0,0.9,0x000000,'Free Drop')
    addFont('Static Mode',0,8,0,0,Math.PI/2,0,0.9,0x000000,'Static Mode')
    addFont('Pole Placement',0,8,0,0,Math.PI/2,0,0.9,0x000000,'Pole Placement')
    addFont('Energy Shaping',0,8,0,0,Math.PI/2,0,0.9,0x000000,'Energy Shaping')
    changeText('Static Mode')

    }
)

const controlModeNameList = ['Free Drop','Pole Placement','Static Mode','Energy Shaping']
const changeText = (text) =>
{
    scene.traverse((child) =>
    {   
        if(child instanceof THREE.Mesh)
        {   
            for (let i = 0; i < 4; i++)
            {   
                if (child.name == controlModeNameList[i])
                {   
                    child.visible = false
                    
                }
            }

            if (child.name == text)
            {
                child.visible = true
                
            }
            
        }
    })
}


/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

const environmentMapTexture = cubeTextureLoader.load([
    './textures/environmentMaps/0/px.png',
    './textures/environmentMaps/0/nx.png',
    './textures/environmentMaps/0/py.png',
    './textures/environmentMaps/0/ny.png',
    './textures/environmentMaps/0/pz.png',
    './textures/environmentMaps/0/nz.png'
])





/**
 * Floor
 */
// const floor = new THREE.Mesh(
//     new THREE.PlaneGeometry(1, 20*ratio),
//     new THREE.MeshStandardMaterial({
//         color: '#eeeeee',
//         metalness: 0,
//         roughness: 0.4,
//         //envMap: environmentMapTexture,
//         envMapIntensity: 0.5
//     })
// )
// floor.position.z = 0 
// floor.receiveShadow = true
// floor.rotation.x = - Math.PI * 0.5
// scene.add(floor)

const track_geometry = new THREE.TorusGeometry( 5*ratio, 0.15*ratio, 16, 100 )
const track_material = new THREE.MeshBasicMaterial( { color: 0xA9A9A9} )
const torus = new THREE.Mesh( track_geometry, track_material )
scene.add( torus )
torus.rotation.x = 0.5*Math.PI 
/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 40
directionalLight.shadow.camera.left = - 40
directionalLight.shadow.camera.top = 40
directionalLight.shadow.camera.right = 40
directionalLight.shadow.camera.bottom = - 40
directionalLight.position.set(0, 5, -5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(20.88154222241871*1.1,6.414799505750304*1.1,-0.06606443898450855*1.1)



scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(-0.35080047646689366,1.522475944774934,-0.06796254854598625)

controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))




/**
 * Animate
 */
const clock = new THREE.Clock()
var oldElapsedTime = clock.getElapsedTime()

// Initial Path


//updateMotion (mass,spring,damp,inputForce,displacement,velocity,timeInterval,mesh)


//#endregion

// GUI
const pole_folder = gui.addFolder( 'Pole' )
const cart_folder = gui.addFolder( 'Cart' )

const control_folder = gui.addFolder( 'Control' )

debugObject.poleAngle = 0
const changePoleAngle = (value) =>
{
    joint_mesh.rotation.x = Math.PI + value/180*Math.PI
    pole.p = value/180*Math.PI
    initialEnergy = m*g*L*cos(pole.p)
    debugObject.theta =  value/180*Math.PI
}
pole_folder.add(debugObject, 'poleAngle').min(-180).max(180).step(0.01).name('Rotation').onChange(changePoleAngle).listen()


debugObject.cartPosition = 0
const changeCartPosition = (value) =>
{
    joint_mesh_0.rotation.y = value/10*Math.PI
    cart.p = value

    debugObject.x =   value
}
cart_folder.add(debugObject, 'cartPosition').min(-10).max(10).step(0.01).name('Position').onChange(changeCartPosition).listen()

const s_folder = control_folder.addFolder( 'State Variables')
debugObject.x =      Math.round(cart.pe*100)/100
debugObject.dx =     Math.round(cart.v *100)/100
debugObject.theta =  Math.round(pole.pe*100)/100
debugObject.dtheta = Math.round(pole.v *100)/100
const updateState = () =>
{
    debugObject.x =      Math.round(cart.pe*100)/100
    debugObject.dx =     Math.round(cart.v *100)/100
    debugObject.theta =  Math.round(pole.pe*100)/100
    debugObject.dtheta = Math.round(pole.v *100)/100
}

s_folder.add(debugObject,'x').name('x').disable().listen()
s_folder.add(debugObject,'dx').name('dx/dt').disable().listen()
s_folder.add(debugObject,'theta').name('\u03B8').disable().listen()
s_folder.add(debugObject,'dtheta').name('d\u03B8/dt').disable().listen()

// Control Folder

debugObject.controlForce = 0
//control_folder.add(debugObject,'controlForce').name('Input Force').min(-50).max(50).listen()

debugObject.targetX = 0
debugObject.targetXDot = 0
debugObject.targetTheta = 0
debugObject.targetThetaDot = 0
control_folder.add(debugObject,'targetX').name('Target Position x').min(-10).max(10)



debugObject.p1 = '-2'
debugObject.p2 = '-2.1'
debugObject.p3 = '-3'
debugObject.p4 = '-3.1'

const round = (value) =>
{
    var ans = 0
    if (typeof value == 'number')
    {
        ans = String(Math.round(value*100)/100)
    }
    else
    {
        ans = String(Math.round(value.re*100)/100) + '+' + String(Math.round(value.im*100)/100) + 'i'
    }
    return ans
}

const getPoles = () =>
{   
    const k1 = debugObject.k1
    const k2 = debugObject.k2
    const k3 = debugObject.k3
    const k4 = debugObject.k4

    const Amatrix = math.matrix([[0,1,0,0], [0, 0,m*g/M,0], [0,0,0,1], [0,0,(m*g+M*g)/(m*L),0]])
    const Bmatirx = math.matrix([[0],[1/M],[0],[1/M]])
    const Kmatrix = math.matrix([[k1,k2,k3,k4]])
    const Tmatrix = math.subtract(Amatrix, math.multiply(Bmatirx,Kmatrix))
    const ans = math.eigs(Tmatrix)
    
    // eivList = [ans.values._data[0],ans.values._data[1],ans.values._data[2],ans.values._data[3]]
    
    // if (typeof ans.values._data[0])

    debugObject.p1 = round(ans.values._data[0])
    debugObject.p2 = round(ans.values._data[1])
    debugObject.p3 = round(ans.values._data[2])
    debugObject.p4 = round(ans.values._data[3])
    

    return ans 
}

const k_folder = control_folder.addFolder( 'K matrix parameters')
getPoles()
k_folder.add(debugObject,'k1').min(-200).max(200).name('k1').onChange(getPoles)
k_folder.add(debugObject,'k2').min(-200).max(200).name('k2').onChange(getPoles)
k_folder.add(debugObject,'k3').min(-200).max(200).name('k3').onChange(getPoles)
k_folder.add(debugObject,'k4').min(-200).max(200).name('k4').onChange(getPoles)


const p_folder = control_folder.addFolder( 'Poles')
p_folder.add(debugObject,'p1').name('p1').listen().disable()
p_folder.add(debugObject,'p2').name('p2').listen().disable()
p_folder.add(debugObject,'p3').name('p3').listen().disable()
p_folder.add(debugObject,'p4').name('p4').listen().disable()

//Start
var startFlag = false
var controlFlag = true
var energyShapingFlag = false
var energyShapingCheckFlag = false

debugObject.start = () =>
{
    startFlag = true
    changeText('Pole Placement')
}
gui.add(debugObject,'start').name('start')

debugObject.pControl = () =>
{
    controlFlag = true
    energyShapingCheckFlag = false
    changeText('Pole Placement')
    // pole.v = 0
    // pole.a = 0
    // cart.p = 0
    // cart.v = 0
    // cart.a = 0

}
gui.add(debugObject,'pControl').name('pole placement control')


debugObject.freeDrop = () =>
{
    controlFlag = false
    energyShapingCheckFlag = false
    changeText('Free Drop')
}
gui.add(debugObject,'freeDrop').name('free drop')

debugObject.unlockTargets = () =>
{
    const configurationGUIarrary = t_folder.children
                
    configurationGUIarrary.forEach(value => 
        {   
            if (value._name == 'target dx/dt' || value._name =='target \u03B8' ||value._name == 'target d\u03B8/dt')
            value.enable()
        })
                
}
gui.add(debugObject,'unlockTargets').name('unlock targets')




const t_folder = control_folder.addFolder( 'Other Targets')
t_folder.add(debugObject,'targetXDot').name('target dx/dt').disable()
t_folder.add(debugObject,'targetTheta').name('target \u03B8').disable()
t_folder.add(debugObject,'targetThetaDot').name('target d\u03B8/dt').disable()

debugObject.energyShapingControl = () =>
{
    energyShapingCheckFlag = true
   
}
gui.add(debugObject,'energyShapingControl').name('energy shaping + pole placement')

const tick = () =>
{   

    stats.begin()
    
    var timeInterval =  clock.getElapsedTime()-oldElapsedTime
    
    // if (cos(pole.p)<cos(30/180*Math.PI) && controlFlag == true)
    // {
    //     energyShapingCheckFlag = true
    // }

    //Motion
    if (startFlag == true)
    {
        Motion(timeInterval)
        //startFlag = false
    }
    
    


    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
    oldElapsedTime = clock.getElapsedTime()
    stats.end()
    
}

tick()