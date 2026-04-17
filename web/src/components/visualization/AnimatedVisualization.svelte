<script>
    import { onMount } from "svelte";

    let container;
    let animationFrame;

    onMount(() => {
        const canvasElement = container.querySelector("canvas");
        if (!canvasElement) return;

        const ctx = canvasElement.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvasElement.width = container.offsetWidth * dpr;
        canvasElement.height = 280 * dpr;
        ctx.scale(dpr, dpr);

        const width = container.offsetWidth;
        const height = 280;

        const nodes = [];
        const nodeCount = 12;

        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: 3 + Math.random() * 3,
                color: `hsla(${30 + Math.random() * 10}, 100%, 60%, ${0.4 + Math.random() * 0.3})`,
            });
        }

        let time = 0;

        function drawNode(node) {
            ctx.fillStyle = node.color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        function drawConnection(from, to) {
            const distance = Math.hypot(to.x - from.x, to.y - from.y);
            if (distance < 150) {
                const opacity = 1 - distance / 150;
                ctx.strokeStyle = `rgba(249, 115, 22, ${opacity * 0.3})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.stroke();
            }
        }

        function animate() {
            // Clear canvas
            ctx.fillStyle = "rgba(20, 20, 30, 0.1)";
            ctx.fillRect(0, 0, width, height);

            // Update nodes
            nodes.forEach((node) => {
                node.x += node.vx;
                node.y += node.vy;

                // Bounce off edges
                if (node.x - node.radius < 0 || node.x + node.radius > width) {
                    node.vx *= -1;
                }
                if (node.y - node.radius < 0 || node.y + node.radius > height) {
                    node.vy *= -1;
                }

                // Keep in bounds
                node.x = Math.max(node.radius, Math.min(width - node.radius, node.x));
                node.y = Math.max(node.radius, Math.min(height - node.radius, node.y));
            });

            // Draw connections
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    drawConnection(nodes[i], nodes[j]);
                }
            }

            // Draw nodes
            nodes.forEach(drawNode);

            time++;
            animationFrame = requestAnimationFrame(animate);
        }

        animate();

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    });
</script>

<div bind:this={container} id="visualization">
    <canvas></canvas>
</div>

<style>
    #visualization {
        width: 300px;
        height: 280px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    canvas {
        width: 100%;
        height: 100%;
        display: block;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(245, 158, 11, 0.02) 100%);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(249, 115, 22, 0.15);
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
    }

    @media screen and (max-width: 768px) {
        #visualization {
            width: 100%;
            max-width: 300px;
        }
    }
</style>
