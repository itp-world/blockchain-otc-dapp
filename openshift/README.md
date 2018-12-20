OpenShift Templates
===


```
oc_project_name= <...>
oc_wildcard_domain= <...>

oc new-project $oc_project_name

oc create -f parity-template-t2.yml
oc new-app parity -p PARITY_VERSION=v1.9.6

oc process -f blockchain-app-template.yml -p API_URL=http://blockchain-app-backend-${oc_project_name}.${oc_wildcard_domain}:3000/api/v1/
```
