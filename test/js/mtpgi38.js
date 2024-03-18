"use strict";

// SHORTCUT FUNCTIONS

const 
	$id = id => document.getElementById(id),
	$q = Element.prototype.$q = function(q) {
		const r = (this instanceof Element ? this : document).querySelectorAll(q);
		return r.length ? r : null;
	},
	show = el => el.classList.remove("hide"),
    hide = el => el.classList.add("hide"),
	correctHeight = () => document.documentElement.style.setProperty("--vh", window.innerHeight * 0.01 + "px"),
	debounce = (fn, time) => {
		time = time || 100;
		let timer;
		return function(event) {
			if (timer) clearTimeout(timer);
			timer = setTimeout(fn, time, event);
		}
	};


// GLOBAL VARIABLES

var	masonry;

function filtrerArticles() {
	const 
		cityVal = $id("select--ville").value,
		keywVal = $id("select--categories").value,
		cityStr = cityVal ? `[data-city*="${cityVal}"]` : "",
		keywStr = keywVal ? `[data-keyword*="${keywVal}"]` : "",
		articlesHide = (cityStr || keywStr) ? $q(`article:not(${cityStr}${keywStr})`) : $q(`article`),
		articlesShow = (cityStr || keywStr) ? $q(`article${cityStr}${keywStr}`) : $q(`article`),
		articlesShowLength = articlesShow.length;
	console.log(articlesShow)
	$q(".card").forEach(show);
	articlesHide.forEach(hide);
	articlesShow.forEach(show);
	if (cityVal) $q(`.card:not([data-city*="${cityVal}"])`).forEach(hide);
	setSelectableLetters();
	$id("text--resultats").innerHTML = (0 == articlesShowLength ? "aucun" : articlesShowLength) + "&nbsp;r&eacute;sultat" + (1 < articlesShowLength ? "s" : "");
	masonry && masonry.recalculate(!0, !0);
}

function selectAllText(artOrCard) {
	if (window.getSelection) {
		document.getSelection().removeAllRanges();
		const range = document.createRange();
		range.setStart(artOrCard.querySelector("hgroup, h3"), 0);
		range.setEndBefore($id("modale"));
		window.getSelection().addRange(range);
	}
}

function toMap(event, addressLink) {
	if (addressLink.href) {
		event.preventDefault();
		const 
			geoURI = addressLink.href.split(/[:,]/), 
			lat = geoURI[1], 
			lng = geoURI[2],
			linker = new DeepLinker({
				onIgnored: () => { 
					console.log("browser failed to respond to the deep link. Fallback.");
					window.open(`https://www.openstreetmap.org/directions?to=${lat},${lng}#map=18/${lat}/${lng}`, "_blank");
				}
			});
		linker.openURL(addressLink.href);
	}
}

function toClipboard(el) {
	const
		newel = el.cloneNode(true),
		classNames = {
			email: "E-mail",
			tel: "Téléphone",
			url: "Site internet",
			adr: "Adresse",
			bus: "Transports en commun",
			info: "Informations",
			hours: "Horaires",
			acc: "Accessibilité",
			facebook: "Compte Facebook",
			twitter: "Compte Twitter",
			instagram: "Compte Instagram",
			youtube: "Chaîne Youtube",
			linkedin: "Profil LinkedIn"
		};
		
	newel.querySelectorAll(".email,.tel,.url,.adr,.bus,.info,.hours,.acc,.facebook,.twitter,.instagram,.youtube,.linkedin").forEach(n => {
		n.innerHTML = classNames[n.className] + " : " + n.innerHTML;
	});
	function copylistener(event) {
		event.preventDefault();
		if (event.clipboardData) {
			event.clipboardData.setData("text/plain", newel.innerText);
			event.clipboardData.setData("text/html", newel.innerHTML);
			document.documentElement.style.setProperty("--copy-opacity", "1");
			setTimeout(() => {
				document.documentElement.style.setProperty("--copy-opacity", "0");
			}, 3000);
		}
		document.removeEventListener("copy", copylistener);
	};
	//selectAllText(el);
	document.addEventListener("copy", copylistener);
	document.execCommand("copy");
}

function printArticle(article) {
	if (confirm("Par souci d’économie, le document a été passé en niveau de gris.\n\nÉconomisez du papier et privilégiez la copie numérique\nou activez le recto/verso !\n\nJe souhaite imprimer ?")) {
		const fr = document.createElement("iframe");
		fr.name = "fr";
		document.body.appendChild(fr);
		const 
			frameDoc = fr.contentWindow ? fr.contentWindow : fr.contentDocument.document ? fr.contentDocument.document : fr.contentDocument,
			title = article.$q("h2").innerText,
			content = article.outerHTML;
		frameDoc.document.open();
		frameDoc.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${title}</title><link rel="stylesheet" href="style.css" type="text/css"></head><body>${content}</body></html>`);
		frameDoc.document.close();
		setTimeout(function() {
			window.frames["fr"].focus();
			window.frames["fr"].print();
			document.body.removeChild(fr);
		}, 500);
	}
}

// VCARD RELATED FUNCTIONS

function showQRCode(artOrCard, isCard) {
	if ($id("qr-code").classList.contains("hide")) {
		const img = $q("#qr-code img");	img && img[0].remove();
		const qr = qrcode(0, "L");
		qr.addData(generateVCARDtext(artOrCard, isCard), "Byte");
		qr.make();
		$id("qr-code").appendChild(qr.createImgTag(5, 0));
		show($id("qr-code"));	
	} else {
		hideQRCode();
	}
}
function hideQRCode() {
	const img = $q("#qr-code img"); img && img[0].remove();
	hide($id("qr-code"));
}

function shareCard(artOrCard, isCard) {
	const vCardText = generateVCARDtext(artOrCard, isCard);
	const vCardName = (isCard ? artOrCard.parentElement : artOrCard).getAttribute("data-vcard") + ".vcf";
	const filesArray = [
		new File(
		  [vCardText],
		  vCardName, {
			type: "text/vcard"
		  }
		)
	];
	const shareData = {
		files: filesArray,
	};
	navigator.share(shareData);
}
function getVCARDUrlParamAndDownload() {
	const 
		params = new URLSearchParams(window.location.search),
		vcarddata = params.get("vcard"),
		index = params.get("i");
	if (vcarddata) {
		generateAndDownloadVCFfile(
		index 
			? $q(`[data-vcard=${vcarddata}]`).$q(".card")[+index] 
			: $q(`[data-vcard=${vcarddata}]`), 
		index 
			? true
			: false
		);
	}
}

function generateAndDownloadVCFfile(artOrCard, isCard) {
	const
		parentArticle = isCard ? artOrCard.parentElement : artOrCard,
		vCardName = isCard ? artOrCard.querySelector("h3").textContent.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9\s-_]/gi, "").replace(/[\s_-]+/g, "_") : parentArticle.getAttribute("data-vcard"),
		textToBLOB = new Blob([generateVCARDtext(artOrCard, isCard)], { type: "text/vcard" }),
		newLink = document.createElement("a");
	newLink.download = vCardName + ".vcf";
	newLink.href = (window.webkitURL != null) ? window.webkitURL.createObjectURL(textToBLOB) : window.URL.createObjectURL(textToBLOB);
	newLink.style.display = "none";
	document.body.appendChild(newLink);
	newLink.click();
	newLink.remove();
}

function generateVCARDtext(artOrCard, isCard) {
	const
		parentArticle = isCard ? artOrCard.parentElement : artOrCard,
		firstCard = parentArticle.querySelector(".card");

	function generateCard(content) {
		content = Array.from(content)
		const 
			escapeChar = text => text.replace(/[\n\r\t]+/g, " ").replace(/\(.+?\)/, "").replace(/([\\,;:])/g, "\\$1"),
			name = content.find(el => el.nodeName === "H2") || content.find(el => el.nodeName === "H3"),
			note = name.querySelector("p");
			
	let vcard_text 	= "BEGIN:VCARD\nVERSION:3.0\nPRODID:-//MTPGI38//NONSGML v1.0//FR\nTZ:+01:00\n" 
					+ "SOURCE:http://mtpgi.github.io/38?vcard=" + parentArticle.getAttribute("data-vcard") + (isCard ? "&i=" + Array.from(parentArticle.querySelectorAll(".card")).indexOf(artOrCard) : "") + "\n"
					+ "REV" + $id("revision").getAttribute("datetime") + "\n"
					+ "FN:" + escapeChar(name.innerText) + "\n"
			+ (note ? "NOTE:" + escapeChar(note.innerText) + "\n" : "");

		content.filter(el => el.classList.contains("tel")).forEach(n => {	
			vcard_text	+= "TEL;TYPE=" 
						+ (n.href.match(/^tel:(0|\+33)6/) ? "CELL" : "VOICE")
						+ (n.classList.contains("pref") ? ";PREF=1" : "") 
						+ ":" + n.href.split(":")[1] + "\n";
		});
		content.filter(el => el.classList.contains("email")).forEach(n => {
			vcard_text 	+= "EMAIL:" 
						+ n.href.split(":")[1] 
						+ "\n"
		});
		content.filter(el => el.classList.contains("url")).forEach(n => {
			vcard_text 	+= "URL:" 
						+ n.href 
						+ "\n"
		});
		content.filter(el => el.className.match(/^facebook|instagram|twitter|youtube|linkedin$/)).forEach(n => {
			const rs = n.classList.value;
			vcard_text += `X-SOCIALPROFILE;type=${rs};x-user=${rs}user:${n.href}\n`
		});
		content.filter(el => el.classList.contains("adr")).forEach(n => {
		  const postOfficeBox = n.querySelector(".post-office-box"),
				extendedAddress = n.querySelector(".extended-address"),
				streetAddress = n.querySelector(".street-address"),
				locality = n.querySelector(".locality"),
				postalCode = n.querySelector(".postal-code"),
				getContent = c => c ? c.innerText.replace(/([\\,;:])/g, "\\$1").replace(/[\n\r]+/, "\\n") :	"";
			if (postOfficeBox || extendedAddress || streetAddress || locality || postalCode) {
				vcard_text 	+= "ADR:" 
							+ getContent(postOfficeBox) + ";"
							+ getContent(extendedAddress) + ";"
							+ getContent(streetAddress) + ";"
							+ getContent(locality) + ";;"
							+ getContent(postalCode) 
							+ ";FRANCE\n";
			}
			const geoURI = n.href;
			if (geoURI) {
				const spl = geoURI.split(/[:,]/);
				vcard_text += "GEO:" + spl[1] + ";" + spl[2] + "\n";
			}
		});
		vcard_text += "END:VCARD";
		return vcard_text;
	}

	function extractBeforeFirstCard() {
		const elementsBeforeFirstCard = [],
			  childNodes = firstCard.parentNode.$q("*");
		for (let node of childNodes) {
			if (node === firstCard) break;
			elementsBeforeFirstCard.push(node);
		}
		return elementsBeforeFirstCard;
	}
	if (isCard) {
		return generateCard([...extractBeforeFirstCard(), ...artOrCard.$q("h3, .adr, .url, .tel, .email, .facebook, .twitter, .instagram, .linkedin, .youtube")], isCard);
	} else {
		if (firstCard) {
			const feed = [];
			parentArticle.querySelectorAll(".card").forEach(card => {
				feed.push([...extractBeforeFirstCard(), ...card.$q("h3, .adr, .url, .tel, .email, .facebook, .twitter, .instagram, .linkedin, .youtube")]);
			});
			let fusionnedVcard = "";
			for (let i = 0; i < feed.length; i++) {
				fusionnedVcard += generateCard(feed[i]) + "\n";
			}
			return fusionnedVcard
		} else {
			return generateCard(parentArticle.$q("h2, h2 p, h3, .adr, .url, .tel, .email, .facebook, .twitter, .instagram, .linkedin, .youtube"));
		}
	}
}

// INIT FUNCTIONS
	
function setSelectableLetters() {
	const arrayOfLetters = [];
	document.querySelectorAll("article:not(.hide)").forEach(article => {
		const firstLetter = article.dataset.vcard.charAt(0);
		if (!arrayOfLetters.includes(firstLetter)) arrayOfLetters.push(firstLetter);
	});
	$id("list-az").innerHTML = "";
	arrayOfLetters.forEach(letter => {
		const bigL = letter.toUpperCase();
		$id("list-az").innerHTML += `<li><input type="radio" name="az" id="letter-${letter}"><label for="letter-${letter}">${bigL}</label></li>`
	});
}

function setLocalities() {
	const citiesArray = []; 
	document.querySelectorAll(".locality").forEach(city => {
		const 
			article = city.closest("article"),
			card = city.closest(".card"),
			cityText = city.innerText.toUpperCase().split(" CEDEX")[0].replace(/[\u0027\u02BC]/g,"\u2019"); //&rsquo;
		
		if (card) card.dataset.city = cityText;
		if (!citiesArray.some(c => c === cityText)) citiesArray.push(cityText);
		article.dataset.city = article.dataset.city ? article.dataset.city + "," + cityText : cityText;
	});
	citiesArray.sort((a, b) => {
		const removePronoun = t => t.replace(/^L([AE] |[\u2019\u0027\u02BC])/, "");
		return removePronoun(a).localeCompare(removePronoun(b));
	});
	$id("list-city").innerHTML = "";
	citiesArray.forEach((city, i) => {
		$id("list-city").innerHTML += `<li><input type="checkbox" name="city" id="city-${i}"><label for="city-${i}">${city}</label></li>`
	});
}

function testShareAPI() {
	const shareData = {files: [new File(["BEGIN:VCARD\nVERSION:3.0\nFN:TEST\nEND:VCARD"],"test.vcf", {type:"text/vcard"})]};
	if (navigator.canShare && navigator.canShare(shareData)) {
		$id("btn-share").classList.remove("hide");
		console.log("Share OK")
	} else {
		console.log("Share not OK")
	}
}

// THEME FUNCTIONS

function setTheme(theme) {
	const switcher = $id("chk--theme-switch");
	if (theme === "dark") {
		document.documentElement.classList.add("theme-dark");
		switcher.setAttribute("checked","true");
		switcher.setAttribute("aria-label","Passer au thème clair");
	} else {
		document.documentElement.classList.remove("theme-dark");
		switcher.removeAttribute("checked");
		switcher.setAttribute("aria-label","Passer au thème sombre");
	}
	isLocalStorageAvailable && localStorage.setItem("theme", theme);
}

function themeChecking() {
	window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", event => {
		setTheme(event.matches ? "dark" : "light");
	});
	document.documentElement.classList.contains("theme-dark") && setTheme("dark");
}

// HANDLE EVENTS FUNCTIONS

var hoveredCardOrArticle;

function handleTouchOrHover(event) {
	const article = event.target.closest("article"),
		  card = event.target.closest(".card");
	if (event.type == "mouseover" && !$id("qr-code").classList.contains("hide")) return;
	if (!article) {
		hoveredCardOrArticle = null;
		hide($id("modale"));
		hideQRCode();
		return
	}
	if (card) {
		show($id("btn-qrcode"));
		if (card !== hoveredCardOrArticle) {
			hideQRCode();
			hoveredCardOrArticle = card;
			card.appendChild($id("modale"));
			show($id("modale"));
		}
	} else {
		const hasCard = article.querySelector(".card");
		if (hasCard) {
			hide($id("btn-qrcode"));
		} else {
			show($id("btn-qrcode"));
		}
		if (article !== hoveredCardOrArticle) {
			hideQRCode();
			hoveredCardOrArticle = article;
			article.appendChild($id("modale"));
			show($id("modale"));
		}
	}
}

function handleClick(event) {
	const t = event.target,
		  article = t.closest("article"),
		  card = t.closest(".card");
	"chk--theme-switch" == t.id			&& setTheme($id("chk--theme-switch").checked ? "dark" : "light");
	"btn--to-top" == t.id	 			&& (event.preventDefault(), $q("header")[0].scrollIntoView({behavior: "smooth"}));
	t.closest(".adr") 					&& (toMap(event, t.closest(".adr")));
	!t.closest("#qr-code, #btn-qrcode") && hideQRCode();
	/* MENU */
	t.closest("#btn-copy") 				&& toClipboard(card || article);
	t.closest("#btn-print") 			&& printArticle(article);
	t.closest("#btn-savecontact") 		&& generateAndDownloadVCFfile(card || article, card ? true : false);
	t.closest("#btn-qrcode") 			&& showQRCode(card || article, card ? true : false);
	t.closest("#btn-share")				&& shareCard(card || article, card ? true : false)
}
function handleScroll(event) {
	if ($id("container").scrollTop > window.innerHeight) {
		show($id("btn--to-top"));
	} else {
		hide($id("btn--to-top"));
	}
}
function handleChange(event) {
	const t = event.target;
	if (t.id == "select--categories" || t.id == "select--ville") {
		filtrerArticles();
		$id("container").scrollTop = 0;
	}
	if (t.id == "select--AZ") {
		const targetArticle = document.querySelector(`article[data-vcard^="${t.value}"]:not(.hide)`);
		targetArticle && targetArticle.scrollIntoView({behavior: "smooth"});
		$id("select--AZ").selectedIndex = 0;
	}
}


window.addEventListener("DOMContentLoaded", e => {
	$id("text--resultats").innerHTML = $q("article").length + "&nbsp;r&eacute;sultats";
	setLocalities();
	setSelectableLetters();
	getVCARDUrlParamAndDownload();
	themeChecking();
	testShareAPI();
});

window.addEventListener("load", e => {
	if (window.innerWidth > 900) {
		$id("main").classList.remove("flex");
		masonry = new Macy({
			container: "main",
			mobileFirst: true,
			columns: 3,
			margin: {y: 50,x: 30},
			breakAt: {1500: 3, 940: 2, 630: 1 }
		});
	}
	correctHeight();
});

window.addEventListener("resize", debounce(correctHeight, 500));
document.addEventListener("touchstart", handleTouchOrHover);
document.addEventListener("mouseover", handleTouchOrHover);
document.addEventListener("click", handleClick);
document.addEventListener("change", handleChange);
$id("container").addEventListener("scroll", handleScroll);