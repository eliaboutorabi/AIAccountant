<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import Icon from '$lib/components/Icon.svelte';
	import { modules } from '$lib/course';
	import { days } from '$lib/course/days';
	import { useBook } from '$lib/course/progress.svelte';
	const book = useBook();
	const next = $derived(modules.find((m) => m.id === book.data.lastModule) ?? modules[0]);
	const questionCount = modules.reduce((sum, m) => sum + m.checks.length, 0);
</script>

<svelte:head
	><title>AI Accountant — Understand it. Build with it.</title><meta
		name="description"
		content="A substantive five-day visual course in AI for accounting and finance: 25 modules, real model training, spreadsheet exercises, worked cases, and interview defense."
	/></svelte:head
>
<div class="page-wrap home-page">
	<div class="welcome-row">
		<div>
			<p class="eyebrow">A FRESH PERSPECTIVE STARTS HERE</p>
			<h2>Hello, future AI accountant <span class="hello-spark">✳</span></h2>
		</div>
		<span class="friendly-pill"><span></span> Understand. Experiment. Build.</span>
	</div>
	<section class="hero">
		<img
			class="hero-art"
			src={asset('/images/hero.webp')}
			alt="A sunlit landscape connecting neural structures, financial tools, and growing ideas"
			fetchpriority="high"
			width="1536"
			height="1024"
		/>
		<div class="hero-wash"></div>
		<div class="hero-copy">
			<span class="hero-badge"
				><Icon name="sparkles" size={14} />THE NUMBERS ARE JUST THE BEGINNING</span
			>
			<h1>Accounting minds.<br />AI <em>possibilities.</em></h1>
			<p>
				Understand the ideas. Test them with real models. Build financial systems you can explain
				and defend.
			</p>
			<a class="button primary" href={resolve('/course/[slug]', { slug: next.id.toLowerCase() })}
				>{Object.keys(book.data.modules).length
					? 'Continue your course'
					: 'Begin the five-day course'}<Icon name="arrow" size={18} /></a
			>
			<div class="hero-caption">
				<span class="tiny-check"><Icon name="check" size={11} /></span>Clear explanations. Serious
				practice. No coding needed to start.
			</div>
		</div>
		<span class="art-note"><Icon name="sprout" size={15} />Big ideas. Room to grow.</span>
	</section>
	<div class="course-facts">
		{#each [{ icon: 'book', title: '25 connected modules', text: 'Five days · 30 planned active hours' }, { icon: 'circleCheck', title: `${questionCount} knowledge checks`, text: 'Worked feedback for every option' }, { icon: 'flask', title: 'Real learning experiments', text: 'Train, inspect, test, and explain' }, { icon: 'folder', title: 'A portfolio with evidence', text: 'Build a system. Defend the decisions.' }] as fact (fact.title)}<div
			>
				<span class="fact-icon"><Icon name={fact.icon} size={22} /></span><span
					><strong>{fact.title}</strong><small>{fact.text}</small></span
				>
			</div>{/each}
	</div>
	<section class="journey-section">
		<div class="section-heading">
			<div>
				<p class="eyebrow">FROM FIRST PRINCIPLES TO PROFESSIONAL JUDGMENT</p>
				<h2>Five days. One connected story.</h2>
			</div>
			<a class="text-link" href={resolve('/path/')}
				>Explore the complete course <Icon name="arrow" size={17} /></a
			>
		</div>
		<div class="part-grid">
			{#each days as day (day.day)}<a class="part-card" href={resolve(`/path/#day-${day.day}`)}
					><div class={`part-art ${day.color}`}>
						<img
							src={asset(`/images/${day.image}.webp`)}
							alt=""
							loading="lazy"
							width="960"
							height="640"
						/><span class="part-number">DAY 0{day.day}</span><span class="round-arrow"
							><Icon name="upRight" size={20} /></span
						>
					</div>
					<div class="part-copy">
						<span class="micro-label">5 MODULES · STUDY, PRACTICE & REVIEW</span>
						<h3>{day.title}</h3>
						<p>{day.question}</p>
						<div class="part-card-bottom">
							<span>6 planned active hours</span><span class="open-label"
								>Explore <Icon name="arrow" size={14} /></span
							>
						</div>
					</div></a
				>{/each}
		</div>
	</section>
	<section class="start-section">
		<div class="start-intro">
			<p class="eyebrow">YOUR NEXT CHAPTER</p>
			<h2>Make the ideas<br />your own.</h2>
			<p>Read the explanation. Work through the records. Predict what will change, then test it.</p>
			<a class="text-link" href={resolve('/course/[slug]', { slug: 'm01' })}
				>Start with the foundations <Icon name="arrow" size={17} /></a
			>
		</div>
		<a class="first-lesson" href={resolve('/course/[slug]', { slug: next.id.toLowerCase() })}
			><div class="lesson-art-mini">
				<img
					src={asset(`/images/${days[next.day - 1].image}.webp`)}
					alt=""
					loading="lazy"
					width="960"
					height="640"
				/><span class="play-circle"><Icon name="play" size={22} /></span>
			</div>
			<div class="first-lesson-copy">
				<span class="micro-label">DAY {next.day} · {next.id}</span>
				<h3>{next.title}</h3>
				<p>{next.subtitle}</p>
				<div class="lesson-mini-meta">
					<span><Icon name="clock" size={14} />{next.minutes} min study & practice</span><span
						><Icon name="circleCheck" size={14} />{next.checks.length} checks + a worked case</span
					>
				</div>
			</div>
			<span class="first-lesson-arrow"><Icon name="arrow" /></span></a
		>
	</section>
	<section class="extra-grid">
		<a class="extra-card lavender" href={resolve('/playground/')}
			><span class="icon-tile white"><Icon name="flask" size={24} /></span>
			<div>
				<span class="micro-label">MAKE A PREDICTION. RUN THE EXPERIMENT.</span>
				<h3>Your learning laboratory.</h3>
				<p>Train a network, inspect a transformer,<br />and work in a living spreadsheet.</p>
				<span class="text-link">Open the labs <Icon name="arrow" size={16} /></span>
			</div>
			<span class="extra-decoration">✳</span></a
		><a class="extra-card butter" href={resolve('/interview/')}
			><span class="icon-tile white"><Icon name="mic" size={24} /></span>
			<div>
				<span class="micro-label">REASON CLEARLY UNDER CHANGING CONSTRAINTS</span>
				<h3>Practice the professional conversation.</h3>
				<p>Make a recommendation. Use evidence.<br />Handle the follow-up.</p>
				<span class="text-link">Enter the interview studio <Icon name="arrow" size={16} /></span>
			</div>
			<span class="extra-decoration small-star">✦</span></a
		>
	</section>
	<div class="home-closing">
		<Icon name="heart" size={18} /><span
			>Made for accountants, analysts, and finance professionals. Timing is a study plan, not a
			measured guarantee; learner piloting is still to come.</span
		>
	</div>
</div>

<style>
	.part-grid {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
	.part-card:last-child:nth-child(3n + 2) {
		grid-column: auto;
	}
	.part-copy p {
		min-height: 65px;
	}
	@media (max-width: 1100px) {
		.part-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 650px) {
		.part-grid {
			grid-template-columns: 1fr;
		}
		.part-copy p {
			min-height: 0;
		}
	}
</style>
