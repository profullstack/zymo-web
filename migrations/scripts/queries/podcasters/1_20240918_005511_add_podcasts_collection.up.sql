-- Write your SQL migration up query here for podcasts


DEFINE TABLE podcasters SCHEMALESS
  PERMISSIONS
    FOR select FULL,
    FOR update, create WHERE $scope = "allusers" OR $scope = "apiusers" OR $scope = "allnostrusers",
	FOR delete WHERE userId = $auth.id OR $auth.isAdmin = true;