<script>
	export let books = [];

	// Function to group books by title if duplicates exist
	function groupBooksByTitle(books) {
		const grouped = {};

		for (const book of books) {
			const title = book.title || 'Unknown Title';

			if (!grouped[title]) {
				grouped[title] = [];
			}

			grouped[title].push(book);
		}

		return grouped;
	}

	let groupedBooks = groupBooksByTitle(books);
</script>

{#if Object.keys(groupedBooks).length}
	<section>
		{#each Object.entries(groupedBooks) as [title, bookGroup]}
			<div class="book-group">
				{#if bookGroup.length > 1}
					<h3>{decodeURIComponent(title)}</h3>
					<ul>
						{#each bookGroup as book}
							<li>
								<a href="/books/{book.id}">Read</a>
								<a href={book.url}
									>({book.bookMetadata?.title ?? book.mediaInfo.title})</a
								>
								{#if book.bookMetadata?.author}
									by ${book.bookMetadata.author}
								{/if}
							</li>
						{/each}
					</ul>
				{:else}
					<div class="single-book">
						<a href="/books/{bookGroup[0].id}">Read</a>
						<a href={bookGroup[0].url}
							>{decodeURIComponent(
								bookGroup[0].bookMetadata?.title ?? bookGroup[0].mediaInfo.title
							)}</a
						>
						{#if bookGroup[0].bookMetadata?.author}
							&nbsp;by {bookGroup[0].bookMetadata.author}
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</section>
{/if}

<style>
	.book-group {
		margin: 1rem 0;
	}

	h3 {
		font-size: 1.8rem;
		font-weight: bold;
	}

	ul {
		margin-left: 1em;
	}

	.single-book,
	li {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		margin: 0.5rem 0;
	}

	.single-book a,
	li a {
		margin-left: 1em;
	}
</style>
