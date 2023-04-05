# default_api

All URIs are relative to *http://localhost*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CreateAuthToken**](default_api.md#CreateAuthToken) | **PUT** /authenticate | 
[**PackageByNameDelete**](default_api.md#PackageByNameDelete) | **DELETE** /package/byName/{name} | Delete all versions of this package.
[**PackageByNameGet**](default_api.md#PackageByNameGet) | **GET** /package/byName/{name} | 
[**PackageByRegExGet**](default_api.md#PackageByRegExGet) | **POST** /package/byRegEx/{regex} | Get any packages fitting the regular expression.
[**PackageCreate**](default_api.md#PackageCreate) | **POST** /package | 
[**PackageDelete**](default_api.md#PackageDelete) | **DELETE** /package/{id} | Delete this version of the package.
[**PackageRate**](default_api.md#PackageRate) | **GET** /package/{id}/rate | 
[**PackageRetrieve**](default_api.md#PackageRetrieve) | **GET** /package/{id} | Interact with the package with this ID
[**PackageUpdate**](default_api.md#PackageUpdate) | **PUT** /package/{id} | Update this content of the package.
[**PackagesList**](default_api.md#PackagesList) | **POST** /packages | Get the packages from the registry.
[**RegistryReset**](default_api.md#RegistryReset) | **DELETE** /reset | Reset the registry


<a name="CreateAuthToken"></a>
# **CreateAuthToken**
> String! CreateAuthToken(authenticationRequest)



Create an access token.
<a name="PackageByNameDelete"></a>
# **PackageByNameDelete**
> PackageByNameDelete(name, xAuthorization)

Delete all versions of this package.
<a name="PackageByNameGet"></a>
# **PackageByNameGet**
> PackageHistoryEntry PackageByNameGet(name, xAuthorization)



Return the history of this package (all versions).
<a name="PackageByRegExGet"></a>
# **PackageByRegExGet**
> PackageMetadata PackageByRegExGet(regex, body, xAuthorization)

Get any packages fitting the regular expression.

Search for a package using regular expression over package names and READMEs. This is similar to search by name.
<a name="PackageCreate"></a>
# **PackageCreate**
> Package PackageCreate(xAuthorization, packageData)


<a name="PackageDelete"></a>
# **PackageDelete**
> PackageDelete(Id_, xAuthorization)

Delete this version of the package.
<a name="PackageRate"></a>
# **PackageRate**
> PackageRating PackageRate(Id_, xAuthorization)


<a name="PackageRetrieve"></a>
# **PackageRetrieve**
> Package PackageRetrieve(Id_, xAuthorization)

Interact with the package with this ID

Return this package.
<a name="PackageUpdate"></a>
# **PackageUpdate**
> PackageUpdate(Id_, package, xAuthorization)

Update this content of the package.

The name, version, and ID must match.  The package contents (from PackageData) will replace the previous contents.
<a name="PackagesList"></a>
# **PackagesList**
> PackageMetadata PackagesList(packageQuery, xAuthorization, offset)

Get the packages from the registry.

Get any packages fitting the query. Search for packages satisfying the indicated query.  If you want to enumerate all packages, provide an array with a single PackageQuery whose name is \&quot;*\&quot;.  The response is paginated; the response header includes the offset to use in the next query.
<a name="RegistryReset"></a>
# **RegistryReset**
> RegistryReset(xAuthorization)

Reset the registry

Reset the registry to a system default state.
