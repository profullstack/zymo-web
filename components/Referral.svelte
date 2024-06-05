<html>
	<script>
		const futureDate = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 365 * 2);
		const referralCode = window.location.pathname.split('/')[2];
		document.cookie = `referralCode=${referralCode}; expires=${futureDate.toUTCString()}; path=/; SameSite=Strict`;
		window.location.href = '/register';
	</script>
</html>
