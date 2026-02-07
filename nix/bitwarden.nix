{pkgs, ...}:
pkgs.buildNpmPackage rec {
  pname = "bitwarden";
  version = "1.0.0";

  src = builtins.path {
    name = pname;
    path = ../.;
  };

  npmDeps = pkgs.importNpmLock {npmRoot = src;};
  npmConfigHook = pkgs.importNpmLock.npmConfigHook;

  installPhase =
    # bash
    ''
      runHook preInstall

      mkdir -p $out
      cp -r /build/.config/raycast/extensions/${pname}/* $out/

      runHook postInstall
    '';

  env = {
    ELECTRON_SKIP_BINARY_DOWNLOAD = 1;
  };
}
