Run it with Minishift and OC v3.10.0
===

```
minishift start --openshift-version "v3.10.0"
```

OpenShift Templates
===


```
oc new-project demo

oc create -f blockchain-app-template.yml
oc create -f parity-template.yml

oc new-app blockchain-app
oc new-app parity
```
