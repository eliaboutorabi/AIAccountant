<script lang="ts">
	import { asset, resolve } from '$app/paths';
	import Icon from '$lib/components/Icon.svelte';
	import { chapters, parts, lessonPath } from '$lib/data/course';
	import { useProgress } from '$lib/context';
	const progress = useProgress();
</script>

<svelte:head
	><title>AI Accountant — A new kind of number person</title><meta
		name="description"
		content="A beautiful, friendly visual course in AI for accounting and finance. Explore 36 lessons, interactive labs, knowledge checks, and practical portfolio projects. No equations required."
	/></svelte:head
>
<div class="page-wrap home-page">
	<div class="welcome-row">
		<div>
			<p class="eyebrow">A FRESH PERSPECTIVE STARTS HERE</p>
			<h2>Hello, future AI accountant <span class="hello-spark">✳</span></h2>
		</div>
		<span class="friendly-pill"><span></span> Your pace. Your possibilities.</span>
	</div>
	<section class="hero">
		<img
			class="hero-art"
			src={asset('/images/hero.webp')}
			alt="A sunlit path winding through a floating world of neural connections, a calculator, and tiny trees"
			fetchpriority="high"
			width="1536"
			height="1024"
		/>
		<div class="hero-wash"></div>
		<div class="hero-copy">
			<span class="hero-badge"
				><Icon name="sparkles" size={14} /> THE NUMBERS ARE JUST THE BEGINNING</span
			>
			<h1>Accounting minds.<br />AI <em>possibilities.</em></h1>
			<p>
				You know the world of numbers. Let’s open up the world of AI — one beautiful, surprisingly
				simple idea at a time.
			</p>
			<a
				class="button primary"
				href={resolve(lessonPath(progress.next.chapter.slug, progress.next.lessonIndex + 1))}
				>{progress.data.completed.length
					? 'Continue your journey'
					: 'Let’s begin your journey'}<Icon name="arrow" size={18} /></a
			>
			<div class="hero-caption">
				<span class="tiny-check"><Icon name="check" size={11} /></span> No coding needed to start. Just
				bring your curiosity.
			</div>
		</div>
		<span class="art-note"><Icon name="sprout" size={15} /> Big ideas. Room to grow.</span>
	</section>
	<div class="course-facts">
		{#each [{ icon: 'book', title: '12 chapters', text: 'One connected journey' }, { icon: 'circleCheck', title: '72 knowledge checks', text: 'Little moments of “I get it”' }, { icon: 'flask', title: 'Learn by playing', text: 'Big ideas you can touch' }, { icon: 'coffee', title: 'Made for real life', text: 'Bite-sized. At your pace.' }] as fact (fact.title)}<div
			>
				<span class="fact-icon"><Icon name={fact.icon} size={22} /></span><span
					><strong>{fact.title}</strong><small>{fact.text}</small></span
				>
			</div>{/each}
	</div>
	<section class="journey-section">
		<div class="section-heading">
			<div>
				<p class="eyebrow">FROM A LITTLE CURIOUS TO A LOT MORE CONFIDENT</p>
				<h2>Your adventure, in three parts.</h2>
			</div>
			<a class="text-link" href={resolve('/path/')}
				>Explore the full path <Icon name="arrow" size={17} /></a
			>
		</div>
		<div class="part-grid">
			{#each parts as part, i (part.title)}<a
					class="part-card"
					href={resolve(`/path/#part-${i + 1}`)}
					><div class={`part-art ${part.color}`}>
						<img
							src={asset(`/images/${part.image}.webp`)}
							alt={i === 0
								? 'A neural tree growing from an open book'
								: i === 1
									? 'A lilac world of speech bubbles and language connections'
									: 'A friendly robot connecting a financial workflow'}
							loading="lazy"
							width="960"
							height="640"
						/><span class="part-number">PART 0{i + 1}</span><span class="round-arrow"
							><Icon name="upRight" size={20} /></span
						>
					</div>
					<div class="part-copy">
						<span class="micro-label">CHAPTERS {part.range}</span>
						<h3>{part.title}</h3>
						<p>{part.subtitle}</p>
						<div class="part-card-bottom">
							<span>{chapters.filter((c) => c.part === i).length * 3} bite-sized lessons</span><span
								class="open-label">Let’s explore <Icon name="arrow" size={14} /></span
							>
						</div>
					</div></a
				>{/each}
		</div>
	</section>
	<section class="start-section">
		<div class="start-intro">
			<p class="eyebrow">YOUR FIRST LITTLE LEAP</p>
			<h2>Start with an “aha!”</h2>
			<p>AI isn’t as unfamiliar as it seems.<br />Let’s connect it to things you already know.</p>
			<a class="text-link" href={resolve(lessonPath('foundations'))}
				>Meet your first chapter <Icon name="arrow" size={17} /></a
			>
		</div>
		<a
			class="first-lesson"
			href={resolve(lessonPath(progress.next.chapter.slug, progress.next.lessonIndex + 1))}
			><div class="lesson-art-mini">
				<img
					src={asset(`/images/${parts[progress.next.chapter.part].image}.webp`)}
					alt=""
					loading="lazy"
					width="960"
					height="640"
				/><span class="play-circle"><Icon name="play" size={22} /></span>
			</div>
			<div class="first-lesson-copy">
				<span class="micro-label"
					>{progress.data.completed.length
						? 'PICK UP WHERE YOU LEFT OFF'
						: 'CHAPTER 01 · A FRIENDLY INTRODUCTION'}</span
				>
				<h3>{progress.next.title}</h3>
				<p>{progress.next.subtitle}</p>
				<div class="lesson-mini-meta">
					<span><Icon name="clock" size={14} /> 8 min with practice</span><span
						><Icon name="circleCheck" size={14} /> 2 quick checks</span
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
				<span class="micro-label">LESS READING. MORE “WHAT IF?”</span>
				<h3>A playground for your mind.</h3>
				<p>Move a slider. Watch a network light up.<br />Make a big idea click.</p>
				<span class="text-link">Come play <Icon name="arrow" size={16} /></span>
			</div>
			<span class="extra-decoration">✳</span></a
		>
		<a class="extra-card butter" href={resolve('/interview/')}
			><span class="icon-tile white"><Icon name="mic" size={24} /></span>
			<div>
				<span class="micro-label">FIND THE WORDS. FIND YOUR CONFIDENCE.</span>
				<h3>Your next interview, reimagined.</h3>
				<p>Real questions. Thoughtful answers.<br />A chance to practice being you.</p>
				<span class="text-link">Step into the studio <Icon name="arrow" size={16} /></span>
			</div>
			<span class="extra-decoration small-star">✦</span></a
		>
	</section>
	<div class="home-closing">
		<Icon name="heart" size={18} /><span
			>For accountants, analysts, finance people, and anyone who’s ready to ask: <em
				>what’s next?</em
			></span
		>
	</div>
</div>
