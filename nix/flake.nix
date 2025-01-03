{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    systems.url = "github:nix-systems/default";
    devenv.url = "github:cachix/devenv";
  };

  nixConfig = {
    extra-trusted-public-keys =
      "devenv.cachix.org-1:w1cLUi8dv3hnoSPGAuibQv+f9TZLr6cv/Hm9XgU50cw=";
    extra-substituters = "https://devenv.cachix.org";
  };

  outputs = { self, nixpkgs, devenv, systems, ... }@inputs:
    let forEachSystem = nixpkgs.lib.genAttrs (import systems);
    # HACK: We want to explicitly set the binary path for the biome binary to the musl variant.
    # The default x86 build fails on NixOS installations, but the musl one works. The alternative is
    # to install biome through Nix, but then we must synchronize the versions of the binaries which is icky.
    enterShellBySystem = {
      x86_64-linux = ''
        export BIOME_BINARY=$(pwd)/plugin/node_modules/@biomejs/cli-linux-x64-musl/biome
      '';
    };
    in {
      devShells = forEachSystem (system:
        let pkgs = nixpkgs.legacyPackages.${system};
        in {
          default = devenv.lib.mkShell {
            inherit inputs pkgs;
            modules = [{
              packages = with pkgs; [
                jq
                nodejs
                nodePackages.typescript-language-server
                marksman
              ];
              enterShell = enterShellBySystem.${system} or "";

              scripts.patch-vscode-settings.exec = ''
                # This script patches .vscode/settings.json to point to the musl variant of the biome binary.
                # This is intended for use on NixOS based systems, where the x64 version of the binary doesn't work.
                cat <<< $(jq '."biome.lspBin" = env.BIOME_BINARY' .vscode/settings.json) > .vscode/settings.json
              '';
            }];
          };
        });
    };
}
