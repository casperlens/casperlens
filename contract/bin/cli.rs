//! This example demonstrates how to use the `odra-cli` tool to deploy and interact with a smart contract.

use casperlens_contract::observability::Observability;
use odra::host::{HostEnv, NoArgs};
use odra::schema::casper_contract_schema::NamedCLType;
use odra_cli::{
    deploy::DeployScript,
    scenario::{Args, Error, Scenario, ScenarioMetadata},
    CommandArg, ContractProvider, DeployedContractsContainer, DeployerExt,
    OdraCli, 
};

/// Deploys the `Observability` contract and adds it to the container.
pub struct ObservabilityDeployScript;

impl DeployScript for ObservabilityDeployScript {
    fn deploy(
        &self,
        env: &HostEnv,
        container: &mut DeployedContractsContainer
    ) -> Result<(), odra_cli::deploy::Error> {
        let _observability = Observability::load_or_deploy(
            &env,
            NoArgs,
            container,
            350_000_000_000 // Adjust gas limit as needed
        )?;

        Ok(())
    }
}

/// Main function to run the CLI tool.
pub fn main() {
    OdraCli::new()
        .about("CLI tool for casperlens_contract smart contract")
        .deploy(ObservabilityDeployScript)
        .contract::<Observability>()
        .build()
        .run();
}
