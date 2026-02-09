import { useCallback, useRef } from 'react';
import { isTrackingAllowed } from '@/components/CookieConsent';

// Extend Window interface for fbq
declare global {
  interface Window {
    fbq: (
      action: string,
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

// Track which events have been fired to prevent duplicates
const firedEvents = new Set<string>();

/**
 * Check if tracking is allowed based on user consent
 */
const canTrack = (): boolean => {
  return isTrackingAllowed() && typeof window !== 'undefined' && !!window.fbq;
};

/**
 * Facebook Pixel Hook
 * Provides methods to track standard Facebook Pixel events
 * with built-in duplicate prevention and privacy compliance
 */
export const useFacebookPixel = () => {
  const lastPageView = useRef<string>('');

  /**
   * Track PageView event - fires on route changes
   * Prevents duplicate firing for the same path
   * Only fires if user has given consent
   */
  const trackPageView = useCallback((path?: string) => {
    if (!canTrack()) {
      console.log('[FB Pixel] PageView skipped (no consent or fbq not loaded)');
      return;
    }

    const currentPath = path || window.location.pathname + window.location.hash;
    
    // Prevent duplicate PageView for the same path
    if (lastPageView.current === currentPath) {
      return;
    }
    
    lastPageView.current = currentPath;
    
    window.fbq('track', 'PageView');
    console.log('[FB Pixel] PageView tracked:', currentPath);
  }, []);

  /**
   * Track Lead event - fires when a form is submitted
   * Uses a unique key to prevent duplicate firing
   * Only fires if user has given consent
   */
  const trackLead = useCallback((uniqueKey?: string) => {
    if (!canTrack()) {
      console.log('[FB Pixel] Lead skipped (no consent)');
      return;
    }

    const eventKey = `Lead_${uniqueKey || Date.now()}`;
    
    // Prevent duplicate Lead events with the same key
    if (firedEvents.has(eventKey)) {
      console.log('[FB Pixel] Lead event skipped (duplicate):', eventKey);
      return;
    }
    
    firedEvents.add(eventKey);
    
    // Clear the event key after 5 seconds to allow future tracking
    setTimeout(() => {
      firedEvents.delete(eventKey);
    }, 5000);
    
    window.fbq('track', 'Lead');
    console.log('[FB Pixel] Lead tracked:', eventKey);
  }, []);

  /**
   * Track Purchase event - fires when a purchase is completed
   * Requires value and currency parameters
   * Only fires if user has given consent
   */
  const trackPurchase = useCallback((value: number, currency: string = 'EGP', orderId?: string) => {
    if (!canTrack()) {
      console.log('[FB Pixel] Purchase skipped (no consent)');
      return;
    }

    const eventKey = `Purchase_${orderId || Date.now()}`;
    
    // Prevent duplicate Purchase events
    if (firedEvents.has(eventKey)) {
      console.log('[FB Pixel] Purchase event skipped (duplicate):', eventKey);
      return;
    }
    
    firedEvents.add(eventKey);
    
    window.fbq('track', 'Purchase', {
      value: value,
      currency: currency,
    });
    console.log('[FB Pixel] Purchase tracked:', { value, currency, orderId });
  }, []);

  /**
   * Track AddToCart event
   * Only fires if user has given consent
   */
  const trackAddToCart = useCallback((value?: number, currency: string = 'EGP') => {
    if (!canTrack()) {
      console.log('[FB Pixel] AddToCart skipped (no consent)');
      return;
    }

    window.fbq('track', 'AddToCart', {
      value: value || 0,
      currency: currency,
    });
    console.log('[FB Pixel] AddToCart tracked:', { value, currency });
  }, []);

  /**
   * Track InitiateCheckout event
   * Only fires if user has given consent
   */
  const trackInitiateCheckout = useCallback((value?: number, currency: string = 'EGP') => {
    if (!canTrack()) {
      console.log('[FB Pixel] InitiateCheckout skipped (no consent)');
      return;
    }

    const eventKey = `InitiateCheckout_${Date.now()}`;
    
    if (firedEvents.has(eventKey)) {
      return;
    }
    
    firedEvents.add(eventKey);
    setTimeout(() => firedEvents.delete(eventKey), 5000);
    
    window.fbq('track', 'InitiateCheckout', {
      value: value || 0,
      currency: currency,
    });
    console.log('[FB Pixel] InitiateCheckout tracked:', { value, currency });
  }, []);

  /**
   * Track CompleteRegistration event
   * Only fires if user has given consent
   */
  const trackCompleteRegistration = useCallback(() => {
    if (!canTrack()) {
      console.log('[FB Pixel] CompleteRegistration skipped (no consent)');
      return;
    }

    const eventKey = `CompleteRegistration_${Date.now()}`;
    
    if (firedEvents.has(eventKey)) {
      return;
    }
    
    firedEvents.add(eventKey);
    setTimeout(() => firedEvents.delete(eventKey), 5000);
    
    window.fbq('track', 'CompleteRegistration');
    console.log('[FB Pixel] CompleteRegistration tracked');
  }, []);

  return {
    trackPageView,
    trackLead,
    trackPurchase,
    trackAddToCart,
    trackInitiateCheckout,
    trackCompleteRegistration,
  };
};

export default useFacebookPixel;
