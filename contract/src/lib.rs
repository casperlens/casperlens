#![cfg_attr(not(test), no_std)]
#![cfg_attr(not(test), no_main)]
extern crate alloc;

pub mod observability;
pub use observability::Observability;
