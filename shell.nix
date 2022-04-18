with import <nixpkgs> { };
stdenv.mkDerivation {
  name = "setup-amber";
  buildInputs = [
    nodePackages.typescript
    nodejs-17_x
  ];
}
