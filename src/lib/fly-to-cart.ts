/**
 * "Fly to cart" animation. Clones the product image and animates it from the
 * main gallery image to the header cart icon using the Web Animations API
 * (no dependencies). Silently no-ops if elements are missing or the user
 * prefers reduced motion.
 *
 * Requires:
 *  - source element with id="pdp-main-image"
 *  - target element with id="cart-fly-target"
 */
export function flyToCart(imageUrl: string): void {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const source = document.getElementById('pdp-main-image');
  const target = document.getElementById('cart-fly-target');
  if (!source || !target) return;

  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();

  const clone = document.createElement('img');
  clone.src = imageUrl;
  Object.assign(clone.style, {
    position: 'fixed',
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    objectFit: 'cover',
    borderRadius: '2px',
    zIndex: '100',
    pointerEvents: 'none',
    boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
  });
  document.body.appendChild(clone);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);

  const anim = clone.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 60}px) scale(0.5)`, opacity: 0.9, offset: 0.6 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.08)`, opacity: 0.2 },
    ],
    { duration: 900, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  );

  anim.onfinish = () => {
    clone.remove();
    // Little pulse on the cart icon.
    target.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }],
      { duration: 350, easing: 'ease-out' },
    );
  };
}
