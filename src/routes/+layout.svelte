<script lang="ts">
	import './layout.css';
	import '@fontsource-variable/dm-sans';
	import '@fontsource-variable/manrope';
	import favicon from '$lib/assets/favicon.svg';
	import { setContext, onMount } from 'svelte';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { LearningProgress } from '$lib/progress.svelte';
	import { CourseProgress, BOOK } from '$lib/course/progress.svelte';
	import { modules } from '$lib/course';
	import { PROGRESS } from '$lib/context';
	import { allLessons, lessonPath } from '$lib/data/course';
	import { terms as glossary } from '$lib/course/terms';
	import Icon from '$lib/components/Icon.svelte';
	let { children } = $props();
	const progress = setContext(PROGRESS, new LearningProgress());
	const book = setContext(BOOK, new CourseProgress());
	const studied = $derived(
		modules.reduce(
			(n, m) => n + m.sections.filter((s) => book.get(m.id).read.includes(s.id)).length,
			0
		)
	);
	const sectionCount = modules.reduce((n, m) => n + m.sections.length, 0);
	const coursePercent = $derived(Math.round((100 * studied) / sectionCount));
	let mobileOpen = $state(false);
	let query = $state('');
	let dialog: HTMLDialogElement;
	const navigation = [
		{ label: 'Course home', href: '/', icon: 'home' },
		{ label: 'Your learning path', href: '/path/', icon: 'route' },
		{ label: 'The playground', href: '/playground/', icon: 'flask' },
		{ label: 'Visual atlas', href: '/visuals/', icon: 'sparkles' },
		{ label: 'Interview studio', href: '/interview/', icon: 'mic' },
		{ label: 'Portfolio projects', href: '/projects/', icon: 'folder' }
	] as const;
	const extras = [
		{ label: 'Technical glossary', href: '/glossary/', icon: 'book' },
		{ label: 'Your progress', href: '/progress/', icon: 'chart' },
		{ label: 'Sources & further reading', href: '/resources/', icon: 'library' }
	] as const;
	const currentTitle = $derived(
		[...navigation, ...extras].find((n) =>
			n.href === '/' ? page.route.id === '/' : page.route.id?.startsWith(n.href.slice(0, -1))
		)?.label ?? 'Your learning path'
	);
	const searchResults = $derived(
		query.trim().length > 1
			? [
					...modules
						.filter((m) =>
							`${m.title} ${m.subtitle} ${JSON.stringify(m.sections)}`
								.toLowerCase()
								.includes(query.toLowerCase().trim())
						)
						.map((m) => ({
							title: m.title,
							subtitle: `Day ${m.day} · ${m.id}`,
							href: `/course/${m.id.toLowerCase()}/` as const,
							icon: 'book'
						})),
					...allLessons
						.filter((l) =>
							`${l.title} ${l.subtitle} ${l.chapter.title} ${l.paragraphs.join(' ')}`
								.toLowerCase()
								.includes(query.toLowerCase().trim())
						)
						.map((l) => ({
							title: l.title,
							subtitle: `Introductory archive · ${l.chapter.title}`,
							href: lessonPath(l.chapter.slug, l.lessonIndex + 1),
							icon: 'book'
						})),
					...glossary
						.filter((g) =>
							`${g.term} ${g.definition}`.toLowerCase().includes(query.toLowerCase().trim())
						)
						.map((g) => ({
							title: g.term,
							subtitle: `Concept · ${g.module}`,
							href: `/glossary/#${g.term.toLowerCase().replaceAll(' ', '-')}` as const,
							icon: 'search'
						}))
				].slice(0, 16)
			: []
	);
	function openSearch() {
		query = '';
		dialog.showModal();
	}
	function keyboard(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
			event.preventDefault();
			openSearch();
		}
	}
	onMount(() => {
		progress.load();
		book.load();
	});
	afterNavigate(() => {
		mobileOpen = false;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#174e43" />
	<meta property="og:site_name" content="AI Accountant" />
	<meta property="og:type" content="website" />
</svelte:head>
<svelte:window onkeydown={keyboard} />
<a class="skip-link" href="#main">Skip to content</a>
{#if mobileOpen}<button
		class="nav-scrim"
		aria-label="Close navigation"
		onclick={() => (mobileOpen = false)}
	></button>{/if}
<aside class="sidebar" class:mobile-open={mobileOpen}>
	<a class="brand" href={resolve('/')} aria-label="AI Accountant home"
		><span class="brand-mark">✦<i></i></span><span
			>AI Accountant<small>A NEW KIND OF NUMBER PERSON</small></span
		></a
	>
	<div class="sidebar-label">YOUR FIELD GUIDE</div>
	<nav aria-label="Main navigation">
		{#each navigation as item (item.href)}
			<a
				href={resolve(item.href)}
				class:active={item.href === '/'
					? page.route.id === '/'
					: page.route.id?.startsWith(item.href.slice(0, -1)) ||
						(item.href === '/path/' &&
							(page.route.id?.startsWith('/learn') || page.route.id?.startsWith('/course'))) ||
						(item.href === '/playground/' && page.route.id?.startsWith('/lab'))}
				aria-current={(
					item.href === '/'
						? page.route.id === '/'
						: page.route.id?.startsWith(item.href.slice(0, -1))
				)
					? 'page'
					: undefined}
				><Icon name={item.icon} size={19} /><span>{item.label}</span
				>{#if item.icon === 'flask'}<span class="tiny-new">PLAY</span>{/if}</a
			>
		{/each}
	</nav>
	<div class="sidebar-label resource-label">YOUR REFERENCE DESK</div>
	<nav aria-label="Resources">
		{#each extras as item (item.href)}<a
				href={resolve(item.href)}
				class:active={page.route.id?.startsWith(item.href.slice(0, -1))}
				aria-current={page.route.id?.startsWith(item.href.slice(0, -1)) ? 'page' : undefined}
				><Icon name={item.icon} size={19} /><span>{item.label}</span></a
			>{/each}
	</nav>
	<div class="sidebar-bottom">
		<div class="journey-note">
			<span class="note-star">✳</span>
			<h3>Understand it.<br />Build with it.</h3>
			<p>Five days of connected learning.</p>
			<div class="progress-heading">
				<span>Sections studied</span><strong>{coursePercent}%</strong>
			</div>
			<div
				class="progress-track"
				role="progressbar"
				aria-label="Course progress"
				aria-valuenow={coursePercent}
				aria-valuemin="0"
				aria-valuemax="100"
			>
				<span style:width={`${coursePercent}%`}></span>
			</div>
			<small>{studied} of {sectionCount} sections studied</small>
		</div>
		<a class="sidebar-footer" href={resolve('/resources/')}
			><span class="mini-avatar"><Icon name="sprout" size={17} /></span> Made for curious minds <Icon
				name="heart"
				size={14}
			/></a
		>
	</div>
</aside>
<div class="app-body">
	<header class="topbar">
		<div class="breadcrumb">
			<button
				class="icon-button mobile-menu"
				onclick={() => (mobileOpen = !mobileOpen)}
				aria-label="Toggle navigation"
				aria-expanded={mobileOpen}><Icon name="menu" /></button
			><span class="breadcrumb-parent">Your learning space</span><span class="breadcrumb-divider"
				>/</span
			><span>{currentTitle}</span>
		</div>
		<div class="topbar-right">
			<button class="search-trigger" aria-label="Search the course" onclick={openSearch}
				><Icon name="search" size={17} /><span>Search concepts and cases…</span><kbd>⌘ K</kbd
				></button
			><span class="learner-avatar" title="Your personal learning space"
				><Icon name="sprout" size={21} /></span
			>
		</div>
	</header>
	<main id="main" tabindex="-1">{@render children()}</main>
	<footer class="page-footer">
		<span>AI Accountant <span class="footer-dot">✦</span> Built for your next chapter.</span><a
			href={resolve('/resources/')}
			>Sources, learning notes & privacy <Icon name="upRight" size={14} /></a
		>
	</footer>
</div>
<dialog
	class="search-dialog"
	{@attach (element) => {
		dialog = element;
	}}
>
	<div class="search-input-row">
		<Icon name="search" /><input
			aria-label="Search the course"
			placeholder="Search modules, cases, and definitions…"
			bind:value={query}
		/><button class="icon-button" aria-label="Close search" onclick={() => dialog.close()}
			><Icon name="x" /></button
		>
	</div>
	<div class="search-results">
		{#if query.trim().length < 2}<div class="search-empty">
				<Icon name="sparkles" size={30} />
				<h3>What are you curious about?</h3>
				<p>Try “overfitting”, “cash”, “tokens”, or “agents”.</p>
			</div>
		{:else}{#each searchResults as result, i (`${result.href}-${i}`)}<a
					href={resolve(result.href)}
					onclick={() => dialog.close()}
					><span class="icon-tile mint"><Icon name={result.icon} /></span><span
						><strong>{result.title}</strong><small>{result.subtitle}</small></span
					><Icon name="arrow" size={17} /></a
				>{:else}<div class="search-empty">
					<h3>No matches just yet.</h3>
					<p>Try a shorter phrase, like “model” or “data”.</p>
				</div>{/each}{/if}
	</div>
	<div class="dialog-hint">Find a concept. Follow the evidence. <kbd>esc to close</kbd></div>
</dialog>
