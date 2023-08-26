# durploy script
# https://github.com/sidnym-ladrut/durploy
desk_mount groups
desk_cpgit groups git@github.com:tloncorp/landscape-apps.git "v4.3.0" "desk/"
send_hood "|commit %groups"

desk_init quorum
desk_cpdir quorum "/path/to/quorum/desk/full/"
desk_inst quorum
