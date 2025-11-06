'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface GlobeProps {
  onTransition: () => void
}

export function Globe({ onTransition }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    let animationFrameId: number

    try {
      // Scene setup
      const scene = new THREE.Scene()
      sceneRef.current = scene

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )
      camera.position.z = 2.5

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      rendererRef.current = renderer
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Cap at 2 for performance
      containerRef.current.appendChild(renderer.domElement)

      // Earth sphere
      const geometry = new THREE.SphereGeometry(1, 64, 64)
      const loader = new THREE.TextureLoader()

      loader.load(
        '/textures/earth-blue-marble.jpg',
        (earthTexture) => {
          const material = new THREE.MeshPhongMaterial({
            map: earthTexture,
            shininess: 10,
          })
          const earth = new THREE.Mesh(geometry, material)
          scene.add(earth)
          setLoading(false)
        },
        undefined,
        (err) => {
          console.error('Error loading Earth texture:', err)
          setError('Failed to load Earth texture')
          setLoading(false)
        }
      )

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
      scene.add(ambientLight)
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
      directionalLight.position.set(5, 3, 5)
      scene.add(directionalLight)

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.05
      controls.enableZoom = true
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.5

      // Click handler
      const handleClick = () => {
        onTransition()
      }
      renderer.domElement.addEventListener('click', handleClick)

      // Handle window resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      window.addEventListener('resize', handleResize)

      // Animation loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
      }
      animate()

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize)
        renderer.domElement.removeEventListener('click', handleClick)
        cancelAnimationFrame(animationFrameId)

        // Dispose Three.js resources
        geometry.dispose()
        scene.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose()
            if (object.material instanceof THREE.Material) {
              object.material.dispose()
            }
          }
        })
        renderer.dispose()

        if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(renderer.domElement)
        }
      }
    } catch (err) {
      console.error('Error initializing Globe:', err)
      setError('Failed to initialize 3D globe')
      setLoading(false)
    }
  }, [onTransition])

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-white">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full h-full relative bg-black">
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-white text-xl">Loading globe...</div>
        </div>
      )}

      {/* "Click to Explore" prompt */}
      {!loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-white text-xl font-semibold bg-black/50 px-6 py-3 rounded-lg">
            Click to Explore
          </div>
        </div>
      )}
    </div>
  )
}
