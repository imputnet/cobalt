<script>
    import { onMount } from "svelte";

    let container: HTMLDivElement;
    let animationFrame: number;

    onMount(() => {
        const canvas = container.querySelector("canvas") as HTMLCanvasElement;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = container.offsetWidth * dpr;
        canvas.height = 280 * dpr;
        ctx.scale(dpr, dpr);

        const width = container.offsetWidth;
        const height = 280;

        interface Node {
            x: number;
            y: number;
            vx: number;
            vy: number;
            radius: number;
            color: string;
        }

        const nodes: Node[] = [];
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

        function drawNode(node: Node) {
            ctx!.fillStyle = node.color;
            ctx!.beginPath();
            ctx!.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx!.fill();

            // Glow effect
            const gradient = ctx!.createRadialGradient(
                node.x,
                node.y,
                0,
                node.x,
                node.y,
                node.radius * 2
            );
            gradient.addColorStop(0, `hsla(${30 + Math.random() * 10}, 100%, 60%, 0.1)`);
            gradient.addColorStop(1, `hsla(${30 + Math.random() * 10}, 100%, 60%, 0)`);
            ctx!.fillStyle = gradient;
            ctx!.fillRect(
                node.x - node.radius * 2,
                node.y - node.radius * 2,
                node.radius * 4,
                node.radius * 4
            );
        }

        function drawConnection(node1: Node, node2: Node, distance: number, maxDistance: number) {
            const alpha = (1 - distance / maxDistance) * 0.3;
            ctx!.strokeStyle = `rgba(249, 115, 22, ${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(node1.x, node1.y);
            ctx!.lineTo(node2.x, node2.y);
            ctx!.stroke();
        }

        function animate() {
            // Clear with fade effect
            ctx!.fillStyle = "rgba(30, 30, 30, 0.05)";
            ctx!.fillRect(0, 0, width, height);

            time += 0.005;

            // Update nodes
            for (const node of nodes) {
                node.x += node.vx;
                node.y += node.vy;

                // Bounce off walls
                if (node.x - node.radius < 0 || node.x + node.radius > width) {
                    node.vx *= -1;
                    node.x = Math.max(node.radius, Math.min(width - node.radius, node.x));
                }
                if (node.y - node.radius < 0 || node.y + node.radius > height) {
                    node.vy *= -1;
                    node.y = Math.max(node.radius, Math.min(height - node.radius, node.y));
                }

                // Apply slight gravity toward center
                const centerX = width / 2;
                const centerY = height / 2;
                const dx = centerX - node.x;
                const dy = centerY - node.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > 0) {
                    node.vx += (dx / distance) * 0.0002;
                    node.vy += (dy / distance) * 0.0002;
                }

                // Apply friction
                node.vx *= 0.9995;
                node.vy *= 0.9995;
            }

            // Draw connections
            const connectionDistance = 150;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        drawConnection(nodes[i], nodes[j], distance, connectionDistance);
                    }
                }
            }

            // Draw nodes
            for (const node of nodes) {
                drawNode(node);
            }

            animationFrame = requestAnimationFrame(animate);
        }

        animate();

        return () => cancelAnimationFrame(animationFrame);
    });
</script>

<div bind:this={container} class="visualization-container">
    <canvas />
</div>

<style>
    .visualization-container {
        width: 100%;
        height: 280px;
        border-radius: 24px;
        overflow: hidden;
        background: linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border: 1px solid rgba(249, 115, 22, 0.2);
        box-shadow:
            inset 0 0 40px rgba(249, 115, 22, 0.1),
            0 8px 32px rgba(0, 0, 0, 0.2);
        margin-bottom: 40px;
        position: relative;
    }

    canvas {
        display: block;
        width: 100%;
        height: 100%;
    }
</style>
