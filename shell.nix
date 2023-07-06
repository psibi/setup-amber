with import <nixpkgs> { };
stdenv.mkDerivation {
  name = "setup-amber";
  buildInputs = [
    nodePackages.typescript
    nodePackages.npm-check-updates
    nodejs
  ];
}
