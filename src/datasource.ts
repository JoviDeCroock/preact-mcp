import MiniSearch from "minisearch";
import { PACKAGES, Repository } from "./constants.js";

const SPLIT_POINT = `------\n`;

export class PreactDataSource {
	private cache = new Map<string, { data: string; timestamp: number }>();
	private cacheTimeout = 5 * 60 * 1000; // 5 minutes
	private searchIndex = new MiniSearch({
		fields: ["section", "description", "context", "type"],
		storeFields: ["section", "description", "context", "type", "priority"],
		searchOptions: {
			boost: { section: 2, type: 3 },
			fuzzy: 0.2,
			prefix: true,
		},
	});

	async getReadme(repository: Repository) {
		const repo = PACKAGES.find((r) => r.name === repository);
		if (!repo) {
			throw new Error(`Repository '${repository}' not found`);
		}

		const content = await this.fetchWithCache(repo.readmeUrl);
		if (!content) {
			throw new Error(`Failed to fetch README for ${repo.name}`);
		}

		return {
			content: [
				{
					type: "text",
					text: `# ${repo.name} README\n\n${content}`,
				},
			],
		};
	}

	async queryDocs(query: string, repository: Repository) {
		const repo = PACKAGES.find((r) => r.name === repository);
		if (!repo) {
			throw new Error(`Repository '${repository}' not found`);
		}

		const results: string[] = [];

		try {
			if (repo.docsUrl) {
				try {
					const docsContent = await this.fetchDocumentation(repo.docsUrl);
					const matches = this.searchInText(
						docsContent,
						query,
						`${repo.name}-docs`,
					);
					if (matches.length > 0) {
						results.push(
							`## ${repo.name} Documentation Results:\n${matches.join("\n\n")}`,
						);
					}
				} catch (error) {
					results.push(
						`## ${repo.name} Documentation: Unable to fetch (${error instanceof Error ? error.message : "Unknown error"})`,
					);
				}
			}

			if (repository !== "preact") {
				const readme = await this.fetchWithCache(repo.readmeUrl);
				results.push(`## ${repo.name} README Results:\n${readme}`);
			}
		} catch (error) {
			results.push(
				`## ${repo.name}: Error - ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}

		const responseText =
			results.length > 0
				? results.join("\n\n---\n\n")
				: `No results found for query: "${query}"`;

		return {
			content: [
				{
					type: "text",
					text: responseText,
				},
			],
		};
	}

	private async fetchWithCache(url: string): Promise<string> {
		const cached = this.cache.get(url);
		const now = Date.now();

		if (cached && now - cached.timestamp < this.cacheTimeout) {
			return cached.data;
		}

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const text = await response.text();
			this.cache.set(url, { data: text, timestamp: now });
			return text;
		} catch (error) {
			throw new Error(
				`Failed to fetch ${url}: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	private async fetchDocumentation(baseUrl: string): Promise<string> {
		const response = await fetch(baseUrl);
		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}
		return await response.text();
	}

	private indexContent(
		text: string,
	): Array<{
		id: string;
		section: string;
		description: string;
		context: string;
		type: string;
		priority: number;
	}> {
		const entries = text.split(SPLIT_POINT);
		const documents = [];

		for (const entry of entries) {
			const lines = entry
				.split("\n")
				.map((line) => line.trim())
				.filter((line) => line);
			if (lines.length === 0) continue;

			const titleMatch = lines.find(
				(line) => line.startsWith("# ") || line.startsWith("## "),
			);
			const section = (titleMatch || "Unknown Section")
				.replace(/^#+\s*/, "")
				.trim();
			const descriptionMatch = lines[0];
			const description = descriptionMatch
				? descriptionMatch.replace(/^\*\*description:\*\*\s*/, "").trim()
				: "";

			// Detect content type and assign priority based on usefulness
			let type = "general";
			let priority = 5;

			// High priority for practical tutorials and getting started content
			if (
				section.toLowerCase().includes("getting started") ||
				section.toLowerCase().includes("tutorial") ||
				section.toLowerCase().includes("hello world") ||
				section.toLowerCase().includes("example")
			) {
				type = "tutorial";
				priority = 1;
			}

			// High priority for code examples - these are very valuable for developers
			if (
				entry.includes("```jsx") ||
				entry.includes("```js") ||
				entry.includes("```typescript")
			) {
				type = "code-example";
				priority = 2;
			}

			// Medium priority for core concepts and patterns
			if (
				section.toLowerCase().includes("component") ||
				section.toLowerCase().includes("hooks") ||
				section.toLowerCase().includes("signals") ||
				section.toLowerCase().includes("forms") ||
				section.toLowerCase().includes("state") ||
				section.toLowerCase().includes("props")
			) {
				type = "core-concept";
				priority = 3;
			}

			// Medium priority for setup and configuration
			if (
				section.toLowerCase().includes("installation") ||
				section.toLowerCase().includes("configuration") ||
				section.toLowerCase().includes("setup")
			) {
				type = "setup";
				priority = 3;
			}

			// Lower priority for API reference (unless specifically searched for)
			if (
				section.toLowerCase().includes("api") ||
				section.toLowerCase().includes("reference")
			) {
				type = "api-reference";
				priority = 4;
			}

			documents.push({
				id: `${section}-${entries.indexOf(entry)}`,
				section,
				description,
				context: entry,
				type,
				priority,
			});
		}

		this.searchIndex.addAll(documents);
		return documents;
	}

	private searchInText(
		text: string,
		query: string,
		repository?: string,
	): string[] {
		// Clear and reindex the content for this search
		this.searchIndex.removeAll();
		const documents = this.indexContent(text);

		const searchResults = this.searchIndex.search(query, {
			fuzzy: 0.2,
			prefix: true,
			boost: {
				section: 2,
				type: 3, // Boost based on content type
			},
			combineWith: "OR",
		});

		// Sort by priority first, then by search score
		const sortedResults = searchResults
			.map((result) => ({
				...result,
				document: documents.find((doc) => doc.id === result.id),
			}))
			.filter((result) => result.document)
			.sort((a, b) => {
				// First sort by priority (lower number = higher priority)
				const priorityDiff =
					(a.document?.priority || 10) - (b.document?.priority || 10);
				if (priorityDiff !== 0) return priorityDiff;

				// Then by search score (higher score = better match)
				return b.score - a.score;
			})
			.slice(0, 10); // Take top 10 results

		const results: string[] = [];
		const seen = new Set<string>();

		for (const result of sortedResults) {
			if (!seen.has(result.id)) {
				seen.add(result.id);

				// Add helpful context labels for different content types
				let context = result.document?.context || "";
				if (
					result.document?.type === "tutorial" ||
					result.document?.type === "code-example"
				) {
					context = `**${result.document.section}** (${result.document.type})\n\n${context}`;
				}

				results.push(context);
			}
		}

		return results;
	}
}
