import { colors } from './colors';

export class Gradient {
  gradient: any;
  initGradient(elementId: string) {
    const canvas = document.getElementById(elementId) as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Animation variables
    let time = 0;
    const gradientColors = [
      { r: 224, g: 17, b: 43 },   // primary
      { r: 241, g: 77, b: 98 },   // primary light
      { r: 179, g: 13, b: 34 }    // primary dark
    ];

    // Animation function
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      
      // Calculate color positions
      const pos1 = (Math.sin(time / 2000) + 1) / 2;
      const pos2 = (Math.sin(time / 2000 + 2) + 1) / 2;
      
      // Add color stops
      gradient.addColorStop(pos1, `rgba(${gradientColors[0].r}, ${gradientColors[0].g}, ${gradientColors[0].b}, 0.2)`);
      gradient.addColorStop(pos2, `rgba(${gradientColors[1].r}, ${gradientColors[1].g}, ${gradientColors[1].b}, 0.2)`);
      
      // Fill canvas
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update time
      time += 16;
      requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }
}