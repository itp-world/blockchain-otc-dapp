#!/bin/bash

usage() { echo "Usage: $0 [-p <string, oc project name, eg blockchain-otc-app>] [-d <string, oc wildcard domain, eg 192.168.64.8.nip.io>]" 1>&2; exit 1; }

while getopts ":p:d:" o; do
    case "${o}" in
        p)
            oc_project_name=${OPTARG}
            ;;
        d)
            oc_wildcard_domain=${OPTARG}
            ;;
        *)
            usage
            ;;
    esac
done
shift $((OPTIND-1))

if [ -z "${oc_project_name}" ] || [ -z "${oc_wildcard_domain}" ]; then
    usage
fi

echo "set openshift project name to = ${oc_project_name}"
echo "set openshift wildcard domain to = ${oc_wildcard_domain}"
echo "creating openshift project..."
oc new-project $oc_project_name
echo "creating parity pod..."
oc create -f parity-template.yml
oc new-app parity -p PARITY_VERSION=stable
# -p PARITY_VERSION=v1.9.6
echo "creating client and backend..."
oc process -f blockchain-app-template.yml -p API_URL=http://blockchain-app-backend-${oc_project_name}.${oc_wildcard_domain}/api/v1/ | oc create -f -
