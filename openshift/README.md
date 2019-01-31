Deploy OpenShift Templates
===

Deploy Openshift templates with the following command
```
bash deploy.sh -p <openshift-project-name> -d <openshift-wildcard-domain>
```


#### Note to nip.io/xip.io Users (esp. Minishift/CDK)
The project name **must not** end with a number, otherwise this will confuse the IP resolution taking the trailing number as part of the IP address.

E.g. 
`otc-app-23` is **not** valid. 

`otc-23-app` is.
