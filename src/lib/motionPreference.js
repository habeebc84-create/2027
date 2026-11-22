import { useSyncExternalStore } from 'react';

const reducedMotionQuery = typeof window === 'undefined'
    ? null
    : window.matchMedia('(prefers-reduced-motion: reduce)');

export function prefersReducedMotion() {
    return reducedMotionQuery?.matches ?? false;
}

function subscribe(onChange) {
    reducedMotionQuery?.addEventListener('change', onChange);
    return () => reducedMotionQuery?.removeEventListener('change', onChange);
}

export function useReducedMotionPreference() {
    return useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}
