/**
 * Shared mount lifecycle options for components that use a Presence primitive.
 * Adapters map these values to Ark/Zag or their own lifecycle implementation.
 */
export interface PresenceContract {
  /** Mount the content only after it first becomes present. Default true. */
  lazyMount?: boolean
  /** Remove content after its exit animation completes. Default true. */
  unmountOnExit?: boolean
  /** Skip the initial enter animation. Default false. */
  skipAnimationOnMount?: boolean
}
