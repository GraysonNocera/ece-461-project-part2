import connexion
import six
from typing import Dict
from typing import Tuple
from typing import Union

from openapi_server.models.authentication_request import AuthenticationRequest  # noqa: E501
from openapi_server.models.error import Error  # noqa: E501
from openapi_server.models.package import Package  # noqa: E501
from openapi_server.models.package_data import PackageData  # noqa: E501
from openapi_server.models.package_history_entry import PackageHistoryEntry  # noqa: E501
from openapi_server.models.package_metadata import PackageMetadata  # noqa: E501
from openapi_server.models.package_query import PackageQuery  # noqa: E501
from openapi_server.models.package_rating import PackageRating  # noqa: E501
from openapi_server import util


def create_auth_token(authentication_request):  # noqa: E501
    """create_auth_token

    Create an access token. # noqa: E501

    :param authentication_request: 
    :type authentication_request: dict | bytes

    :rtype: Union[str, Tuple[str, int], Tuple[str, int, Dict[str, str]]
    """
    if connexion.request.is_json:
        authentication_request = AuthenticationRequest.from_dict(connexion.request.get_json())  # noqa: E501
    return 'do some magic!'


def package_by_name_delete(name, x_authorization=None):  # noqa: E501
    """Delete all versions of this package.

     # noqa: E501

    :param name: 
    :type name: str
    :param x_authorization: 
    :type x_authorization: str

    :rtype: Union[None, Tuple[None, int], Tuple[None, int, Dict[str, str]]
    """
    return 'do some magic!'


def package_by_name_get(name, x_authorization=None):  # noqa: E501
    """package_by_name_get

    Return the history of this package (all versions). # noqa: E501

    :param name: 
    :type name: str
    :param x_authorization: 
    :type x_authorization: str

    :rtype: Union[List[PackageHistoryEntry], Tuple[List[PackageHistoryEntry], int], Tuple[List[PackageHistoryEntry], int, Dict[str, str]]
    """
    return 'do some magic!'


def package_by_reg_ex_get(regex, body, x_authorization=None):  # noqa: E501
    """Get any packages fitting the regular expression.

    Search for a package using regular expression over package names and READMEs. This is similar to search by name. # noqa: E501

    :param regex: 
    :type regex: str
    :param body: 
    :type body: str
    :param x_authorization: 
    :type x_authorization: str

    :rtype: Union[List[PackageMetadata], Tuple[List[PackageMetadata], int], Tuple[List[PackageMetadata], int, Dict[str, str]]
    """
    return 'do some magic!'


def package_create(x_authorization, package_data):  # noqa: E501
    """package_create

     # noqa: E501

    :param x_authorization: 
    :type x_authorization: str
    :param package_data: 
    :type package_data: dict | bytes

    :rtype: Union[Package, Tuple[Package, int], Tuple[Package, int, Dict[str, str]]
    """
    if connexion.request.is_json:
        package_data = PackageData.from_dict(connexion.request.get_json())  # noqa: E501
    return 'do some magic!'


def package_delete(id, x_authorization=None):  # noqa: E501
    """Delete this version of the package.

     # noqa: E501

    :param id: Package ID
    :type id: str
    :param x_authorization: 
    :type x_authorization: str

    :rtype: Union[None, Tuple[None, int], Tuple[None, int, Dict[str, str]]
    """
    return 'do some magic!'


def package_rate(id, x_authorization=None):  # noqa: E501
    """package_rate

     # noqa: E501

    :param id: 
    :type id: str
    :param x_authorization: 
    :type x_authorization: str

    :rtype: Union[PackageRating, Tuple[PackageRating, int], Tuple[PackageRating, int, Dict[str, str]]
    """
    return 'do some magic!'


def package_retrieve(id, x_authorization=None):  # noqa: E501
    """Interact with the package with this ID

    Return this package. # noqa: E501

    :param id: ID of package to fetch
    :type id: str
    :param x_authorization: 
    :type x_authorization: str

    :rtype: Union[Package, Tuple[Package, int], Tuple[Package, int, Dict[str, str]]
    """
    return 'do some magic!'


def package_update(id, package, x_authorization=None):  # noqa: E501
    """Update this content of the package.

    The name, version, and ID must match.  The package contents (from PackageData) will replace the previous contents. # noqa: E501

    :param id: 
    :type id: str
    :param package: 
    :type package: dict | bytes
    :param x_authorization: 
    :type x_authorization: str

    :rtype: Union[None, Tuple[None, int], Tuple[None, int, Dict[str, str]]
    """
    if connexion.request.is_json:
        package = Package.from_dict(connexion.request.get_json())  # noqa: E501
    return 'do some magic!'


def packages_list(package_query, x_authorization=None, offset=None):  # noqa: E501
    """Get the packages from the registry.

    Get any packages fitting the query. Search for packages satisfying the indicated query.  If you want to enumerate all packages, provide an array with a single PackageQuery whose name is \&quot;*\&quot;.  The response is paginated; the response header includes the offset to use in the next query. # noqa: E501

    :param package_query: 
    :type package_query: list | bytes
    :param x_authorization: 
    :type x_authorization: str
    :param offset: Provide this for pagination. If not provided, returns the first page of results.
    :type offset: str

    :rtype: Union[List[PackageMetadata], Tuple[List[PackageMetadata], int], Tuple[List[PackageMetadata], int, Dict[str, str]]
    """
    if connexion.request.is_json:
        package_query = [PackageQuery.from_dict(d) for d in connexion.request.get_json()]  # noqa: E501
    return 'do some magic!'


def registry_reset(x_authorization=None):  # noqa: E501
    """Reset the registry

    Reset the registry to a system default state. # noqa: E501

    :param x_authorization: 
    :type x_authorization: str

    :rtype: Union[None, Tuple[None, int], Tuple[None, int, Dict[str, str]]
    """
    return 'do some magic!'
