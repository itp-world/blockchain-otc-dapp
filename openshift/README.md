OpenShift Templates
===


```
oc new-project demo

oc create -f blockchain-app-template.yml
oc create -f parity-template.yml

oc new-app blockchain-app
oc new-app parity -p PARITY_VERSION=v1.9.6
```
