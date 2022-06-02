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
const joint = {}
const pole = {}

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

const ratio = 3
//Cart
const cart_geometry = new THREE.BoxGeometry( 1*ratio, 1*ratio, 2*ratio )
cart.color = new THREE.Color(0xaed6f1)
cart.velocity = 0
const cart_material = new THREE.MeshStandardMaterial( { color: cart['color'] } )
cart_material.metalness = 0      
cart_material.roughness = 1
cart_material.emissiveIntensity = 0
const cart_mesh = new THREE.Mesh( cart_geometry, cart_material )
cart_mesh.position.y = 0
cart_mesh.position.z = 0
cart_mesh.position.x = 0
scene.add( cart_mesh )


//Concetion
const joint_geometry = new THREE.BoxGeometry( 0.4*ratio, 0.3*ratio, 0.5*ratio )
joint.color = new THREE.Color(0xdc143c)
const joint_material = new THREE.MeshStandardMaterial( { color: joint['color'] } )
joint_material.metalness = 0      
joint_material.roughness = 1
joint_material.emissiveIntensity = 0
const joint_mesh = new THREE.Mesh( joint_geometry, joint_material )
scene.add( joint_mesh )
cart_mesh.add(joint_mesh)
joint_mesh.position.y = 0
joint_mesh.position.z = 0
joint_mesh.position.x = 0.7*ratio



debugObject.theta = 0
const theta = (value) =>
{
    joint_mesh.rotation.x = value/180*Math.PI,0,0

}
const control_folder = gui.addFolder( 'Controls' )
control_folder.add(debugObject,'theta').min(-180).max(180).step(0.01).name('Rotation').onChange(theta).listen()


//Pole
pole.angleVelocity = 0
const pole_geometry = new THREE.CylinderGeometry( 0.15*ratio, 0.15*ratio, 3*ratio, 64)
pole.color = new THREE.Color(0x000000)
const pole_material = new THREE.MeshStandardMaterial( { color: pole['color'] } )
const pole_mesh = new THREE.Mesh( pole_geometry, pole_material )


scene.add( pole_mesh )
joint_mesh.add(pole_mesh)
pole_mesh.position.y = -1.5*ratio
pole_mesh.position.z = 0
pole_mesh.position.x = 0


// Set cart acceleration
debugObject.cartAcceleration = 0
control_folder.add(debugObject,'cartAcceleration').min(-5).max(5).step(0.01).name('Cart Acceleration').listen()

// Cart Motion
const cartMotion = (timeInterval) =>
{
    if (pole.angleVelocity == 0)
    {

    }
    else
    {
        debugObject.cartAcceleration = getControlInput()

    }
    cart.velocity -= debugObject.cartAcceleration*timeInterval
    if (Math.abs(debugObject.cartAcceleration)<0.01)
        {
            debugObject.cartAcceleration=0
            cart.velocity = 0
        }
    cart_mesh.position.z += cart.velocity*timeInterval
    poleAccelerationToAngleAcceleration()

}


// Set angle acceleration
debugObject.angleAcceleration = 0
//control_folder.add(debugObject,'angleAcceleration').min(-1).max(1).step(0.01).name('Angle Acceleration')

// Pole Motion
const poleMotion = (timeInterval) =>
{
    pole.angleVelocity += debugObject.angleAcceleration*timeInterval
    joint_mesh.rotation.x += pole.angleVelocity*timeInterval
    debugObject.theta =  joint_mesh.rotation.x/Math.PI*180
}

const g = 9.8
const l = 3
const poleAccelerationToAngleAcceleration = () =>
{
    debugObject.angleAcceleration = -g*Math.sin(joint_mesh.rotation.x)/l-
    Math.cos(joint_mesh.rotation.x)/l*debugObject.cartAcceleration
}

const m = 0.5   
debugObject.k = 5   
control_folder.add(debugObject,'k').min(0).max(10).step(0.01).name('k')
// Control Input

debugObject.accelerationBound = 7
control_folder.add(debugObject,'accelerationBound').min(0).max(10).step(0.01).name('Acceleration Bound')
const getControlInput = () =>
{
    const E = 0.5*m*l**2*(pole.angleVelocity**2) - 
    (1-Math.cos(joint_mesh.rotation.x))*m*g*l
    const Ed = m*g*l

    
    var u = debugObject.k*(E-Ed)*pole.angleVelocity*Math.cos(joint_mesh.rotation.x)
    var angleError =Math.abs(joint_mesh.rotation.x)- Math.PI
    if (joint_mesh.rotation.x<0)
    {
        angleError = -angleError
    }
    
    if (Math.abs(angleError) < 30/180*Math.PI)
        {
            u = l*
            (g*Math.sin(joint_mesh.rotation.x)/l-1*pole.angleVelocity-4*angleError)
        }
    if (Math.abs(u)>debugObject.accelerationBound)
    {
        u = u/Math.abs(u)*debugObject.accelerationBound 
        
    }
    else
    {

    }
    if (controFlag == false)
    {
        u = 0
    }
    //console.log(u)
    return u
}

var startFlag = false

debugObject.start = () =>
{
    startFlag = true
}
control_folder.add(debugObject,'start').name('start')

var controFlag = false
debugObject.control = () =>
{
    controFlag = true
}
control_folder.add(debugObject,'control').name('control')


debugObject.reset = () =>
{   
    cart_mesh.position.z = 0
    cart.velocity = 0
    debugObject.cartAcceleration =0
    
    joint_mesh.rotation.x = 0
    pole.angleVelocity = 0
    debugObject.angleAcceleration = 0
    startFlag = false
    controFlag = false
    //camera.position.set(10*3,5*3,0)
}

control_folder.add(debugObject,'reset').name('reset')

const fontLoader = new FontLoader()
fontLoader.load(
    './fonts/helvetiker_regular.typeface.json',
    (font) =>
    {   
        function addFont(textContent,x,y,z,xRotation,yRotation,zRotation,size,color)
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
            text.name = 'textTitle'
            textGeometry.center()
            text.rotation.x = xRotation
            text.rotation.y = yRotation
            text.rotation.z = zRotation
                
            text.position.set(x,y,z)
            scene.add(text)
            console.log(font)
        }
    addFont('PolyU Virtual Lab',0,15,0,0,Math.PI/2,0,1,0x000000) 
    addFont('Inverted Pendulum',0,13,0,0,Math.PI/2,0,0.9,0x000000) 
    }
)
//#region
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
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 20*ratio),
    new THREE.MeshStandardMaterial({
        color: '#eeeeee',
        metalness: 0,
        roughness: 0.4,
        //envMap: environmentMapTexture,
        envMapIntensity: 0.5
    })
)
floor.position.z = 0 
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

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
camera.position.set(10*3,2*3,0)

scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
//controls.target.set(-1.408398394653397,2.6876775058076157,-9.350533273702874)

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

const tick = () =>
{   

    stats.begin()
    
    var timeInterval =  clock.getElapsedTime()-oldElapsedTime
    oldElapsedTime = clock.getElapsedTime()

    //Motion
    if (startFlag == true)
    {
        cartMotion(timeInterval)
    }
    poleMotion(timeInterval)
    //console.log(joint_mesh.rotation.x)
    
    
    // changePosition(elapsedTime*0.1*cart['velocity'])
    controls.update()


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)


    stats.end()
    
}

tick()