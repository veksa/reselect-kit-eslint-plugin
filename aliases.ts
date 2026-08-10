/**
 * Test fixture: a barrel module that re-exports the cached selector creators
 * under shorter names, the way applications usually wrap them.
 *
 * Only used by the rule tests, through `file.ts`.
 */
export {createCachedSelector as cached} from '@veksa/re-reselect';
export {
    createCachedSequenceSelector as cachedSeq,
    createCachedStructuredSelector as cachedStruct,
    createPropSelector as prop,
    defaultKeySelector,
    stringComposeKeySelectors,
} from 'reselect-kit';
