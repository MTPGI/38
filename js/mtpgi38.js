"use strict";

// SHORTCUT FUNCTIONS

const
	$id = id => document.getElementById(id),
	$q = Element.prototype.$q = function(q) {
		const r = (this instanceof Element ? this : document).querySelectorAll(q);
		return r.length ? Array.from(r) : null;
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

var masonry;
const villes = {
	"AMPUIS": "007",
	"BARRAUX": "027",
	"BEAUREPAIRE": "034",
	"LE BOURG-D’OISANS": "052",
	"BOURGOIN-JALLIEU": "053",
	"CHASSE-SUR-RHÔNE": "087",
	"CHAVANOZ": "097",
	"LA CÔTE-SAINT-ANDRÉ": "130",
	"CRÉMIEU": "138",
	"CROLLES": "140",
	"ÉCHIROLLES": "151",
	"EYBENS": "158",
	"FONTAINE": "169",
	"FONTANIL-CORNILLON": "170",
	"GIÈRES": "179",
	"GRENOBLE": "185",
	"L’ISLE-D’ABEAU": "193",
	"MENS": "226",
	"MEYLAN": "229",
	"MONESTIER DE CLERMONT": "242",
	"LA MURE": "269",
	"PONTCHARRA": "314",
	"LE PONT DE BEAUVOISIN": "315",
	"PONT-DE-CHÉRUY": "316",
	"LE PONT-DE-CLAIX": "317",
	"PONT-EN-ROYANS": "319",
	"ROUSSILLON": "344",
	"SAINT-ÉGRÈVE": "382",
	"SAINT-ISMIER": "397",
	"SAINT-LAURENT-DU-PONT": "412",
	"SAINT-MARCELLIN": "416",
	"SAINT-MARTIN-D’HÈRES": "421",
	"SEYSSINS": "486",
	"LA TOUR-DU-PIN": "509",
	"LA TRONCHE": "516",
	"TULLINS": "517",
	"VIENNE": "544",
	"VIF": "545",
	"VILLARD-BONNOT": "547",
	"VILLARD-DE-LANS": "548",
	"VILLEFONTAINE": "553",
	"VIZILLE": "562",
	"VOIRON": "563"
};

function filtrerArticles() {
	const
		cityVal = $id("select--ville").value,
		keywVal = $id("select--categories").value,
		cityStr = cityVal ? `[data-city*="${cityVal}"]` : "",
		keywStr = keywVal ? `[data-keyword*="${keywVal}"]` : "",
		articlesHide = (cityStr || keywStr) ? $q(`article:not(${cityStr}${keywStr})`) : $q(`article`),
		articlesShow = (cityStr || keywStr) ? $q(`article${cityStr}${keywStr}`) : $q(`article`);
	$q(".card").forEach(show);
	articlesHide.forEach(hide);
	articlesShow.forEach(show);
	if (cityVal) $q(`.card:not([data-city*="${cityVal}"])`).forEach(hide);
	setSelectableLetters();
	const l = articlesShow.length;
	$id("text--resultats").innerHTML = (0 == l ? "aucun" : l) + "&nbsp;r&eacute;sultat" + (1 < l ? "s" : "");
	masonry && masonry.recalculate(!0, !0);
}

function selectAllText(artOrCard) {
	if (window.getSelection) {
		const selection = document.getSelection();
		selection.removeAllRanges();
		const range = document.createRange();
		range.setStart(artOrCard.querySelector("header, h3"), 0);
		range.setEndBefore($id("modale"));
		window.getSelection().addRange(range);
	}
}

function toMap(event, addressLink) {
	const isDesktop = (!/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4)));
	if (isDesktop && addressLink.href) {
		event.preventDefault();
		const
			geoURI = addressLink.href.split(/[:,]/),
			lat = geoURI[1],
			lng = geoURI[2];
		window.open(`https://www.openstreetmap.org/directions?to=${lat},${lng}#map=18/${lat}/${lng}`, "_blank");
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
	document.addEventListener("copy", copylistener);
	document.execCommand("copy");
}

function printArticle(article) {
	const response = confirm("Par souci d’économie, le document a été passé en niveau de gris.\n\nÉconomisez du papier et privilégiez la copie numérique\nou activez le recto/verso !\n\nJe souhaite imprimer ?");
	if (response) {
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
	if (!$id("qr-code").classList.contains("hide")) {
		hideQRCode();
		return
	}
	const
		img = $q("#qr-code img"),
		data = generateVCARDtext(artOrCard, isCard),
		qr = qrcode(0, "L");
	img && img.remove();
	qr.addData(data, "Byte");
	qr.make();
	$id("qr-code").appendChild(qr.createImgTag(5, 0));
	show($id("qr-code"));
}

function hideQRCode() {
	const img = $q("#qr-code img");
	img && img[0].remove();
	hide($id("qr-code"));
}

function getVCARDUrlParamAndDownload() {
	const
		params = new URLSearchParams(window.location.search),
		vcarddata = params.get("vcard"),
		index = params.get("i");
	if (vcarddata) generateAndDownloadVCFfile(index ? $q(`[data-vcard=${vcarddata}]`)[0].$q(".card")[+index] : $q(`[data-vcard=${vcarddata}]`)[0], index ? true : false);
}

function generateAndDownloadVCFfile(artOrCard, isCard) {
	function convertName(str) {
		return str.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9\s-_]/gi, "").replace(/[\s_-]+/g, "_");
	}
	const
		parentArticle = isCard ? artOrCard.parentElement : artOrCard,
		vcard_name = isCard ? convertName(artOrCard.querySelector("h3").textContent) : parentArticle.getAttribute("data-vcard"),
		text = generateVCARDtext(artOrCard, isCard),
		textToBLOB = new Blob([text], {
			type: "text/vcard"
		}),
		newLink = document.createElement("a");
	newLink.download = vcard_name + ".vcf";
	if (window.webkitURL != null) {
		newLink.href = window.webkitURL.createObjectURL(textToBLOB);
	} else {
		newLink.href = window.URL.createObjectURL(textToBLOB);
		newLink.style.display = "none";
		document.body.appendChild(newLink);
	}
	newLink.click();
	newLink.remove();
}

function generateVCARDtext(artOrCard, isCard) {
	const
		parentArticle = isCard ? artOrCard.parentElement : artOrCard,
		vcard_name = parentArticle.getAttribute("data-vcard"),
		firstCard = parentArticle.querySelector(".card");

	function generateCard(content) {
		let vcard_text = "BEGIN:VCARD\nVERSION:3.0\nPRODID:-//MTPGI38//NONSGML v1.0//FR\nTZ:+01:00\n";
		const
			escapeChar = txt => txt.replace(/[\n\r\t]+/g, " ").replace(/\(.+?\)/, "").replace(/([\\,;:])/g, "\\$1"),
			name = content.find(el => el.nodeName === "H2") || content.find(el => el.nodeName === "H3"),
			note = name.querySelector("p");
		vcard_text += "SOURCE:http://mtpgi.github.io/38?vcard=" + vcard_name + (isCard ? "&i=" + Array.from(parentArticle.querySelectorAll(".card")).indexOf(artOrCard) : "") + "\n";
		vcard_text += "REV:" + $id("revision").innerText.split("/").reverse().join("-") + "T00:00:00Z\n";
		vcard_text += "FN:" + escapeChar(name.innerText) + "\n";
		if (note) {
			vcard_text += "NOTE:" + escapeChar(note.innerText) + "\n"
		}
		content.filter(el => el.classList.contains("tel")).forEach(function(n) {
			const
				// telTypes = ["HOME", "WORK", "PREF", "VOICE", "FAX", "MSG", "CELL", "VIDEO", "TEXTPHONE", "TEXT"];
				telType = (n.href.startsWith("tel:+336") || n.href.startsWith("tel:06")) ? "CELL" : "VOICE",
				pref = n.classList.contains("pref") ? ";PREF=1" : "";
			vcard_text += "TEL;TYPE=" + telType + pref + ":" + n.href.split(":")[1] + "\n";
		});
		content.filter(el => el.classList.contains("email")).forEach(function(n) {
			vcard_text += "EMAIL:" + n.href.split(":")[1] + "\n"
		});
		content.filter(el => el.classList.contains("url")).forEach(function(n) {
			vcard_text += "URL:" + n.href + "\n"
		});
		content.filter(el => el.className.match(/^facebook|instagram|twitter|youtube|linkedin$/)).forEach(function(n) {
			const rs = n.classList.value;
			vcard_text += `X-SOCIALPROFILE;type=${rs};x-user=${rs}user:${n.href}\n`
		});
		content.filter(el => el.classList.contains("adr")).forEach(n => {
			const postOfficeBox = n.querySelector(".post-office-box"),
				extendedAddress = n.querySelector(".extended-address"),
				streetAddress = n.querySelector(".street-address"),
				locality = n.querySelector(".locality"),
				postalCode = n.querySelector(".postal-code"),
				getContent = c => c ? c.innerText.replace(/([\\,;:])/g, "\\$1").replace(/[\n\r]+/, "\\n") : "",
				adr = "ADR:" +
				getContent(postOfficeBox) + ";" +
				getContent(extendedAddress) + ";" +
				getContent(streetAddress) + ";" +
				getContent(locality) + ";;" +
				getContent(postalCode) +
				";FRANCE\n",
				geoURI = n.href;
			if (postOfficeBox || extendedAddress || streetAddress || locality || postalCode) {
				vcard_text += adr
			}
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

// INIT FUNCTIONS, REUSED LATER

function setSelectableLetters() {
	const arrayOfLetters = [];
	document.querySelectorAll("article:not(.hide)").forEach(article => {
		const firstLetter = article.dataset.vcard.charAt(0);
		if (!arrayOfLetters.includes(firstLetter)) arrayOfLetters.push(firstLetter);
	});
	$id("select--AZ").innerHTML = $id("select--AZ").children[0].outerHTML;
	arrayOfLetters.forEach(letter => {
		const option = document.createElement("option");
		option.value = letter;
		option.textContent = letter.toUpperCase();
		$id("select--AZ").appendChild(option);
	});
}

function setLocalities() {
	const citiesArray = [];
	document.querySelectorAll(".locality").forEach(city => {
		const
			article = city.closest("article"),
			card = city.closest(".card"),
			cityText = city.innerText.trim().toUpperCase().split(" CEDEX")[0].replace(/[\u0027\u02BC]/g, "’"),
			cityNb = villes[cityText];
		if (cityNb) {
			if (!citiesArray.some(c => c.nb === cityNb)) citiesArray.push({
				text: cityText,
				nb: cityNb
			});
			if (article.dataset.city) {
				article.dataset.city += `,${cityNb}`;
			} else {
				article.dataset.city = cityNb;
			}
			if (card) card.dataset.city = cityNb;
		} else {
			console.error(cityText + " has no match in the array")
		}
	});
	citiesArray.sort((a, b) => {
		const removePronoun = t => t.replace(/^L([AE] |[\u2019\u0027\u02BC])/, "");
		return removePronoun(a.text).localeCompare(removePronoun(b.text));
	});
	citiesArray.forEach(city => {
		const option = document.createElement("option");
		option.value = city.nb;
		option.textContent = city.text;
		$id("select--ville").appendChild(option);
	});
}

// THEME FUNCTIONS

function setTheme(theme) {
	if (theme === "dark") {
		document.documentElement.classList.add("theme-dark");
		$id("chk--theme-switch").setAttribute("checked", "true");
		$id("chk--theme-switch").setAttribute("aria-label", "Passer au thème clair");
	} else {
		document.documentElement.classList.remove("theme-dark");
		$id("chk--theme-switch").removeAttribute("checked", "true");
		$id("chk--theme-switch").setAttribute("aria-label", "Passer au thème sombre");
	}
	if (isLocalStorageAvailable) localStorage.setItem("theme", theme);
}

function themeChecking() {
	if (window.matchMedia) {
		window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", event => {
			const pref = event.matches ? "dark" : "light";
			setTheme(pref);
		});
	}
	if (document.documentElement.classList.contains("theme-dark")) {
		setTheme("dark")
	}
}

// HANDLE EVENTS FUNCTIONS

var hoveredCardOrArticle;

function handleTouchOrHover(event) {
	const article = event.target.closest("article"),
		card = event.target.closest(".card");
	if (event.type == "mouseover" && !$id("qr-code").classList.contains("hide")) return;
	if (!article) {
		hoveredCardOrArticle = false;
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
		a = t.closest("article"),
		c = t.closest(".card");
	"chk--theme-switch" == t.id && setTheme($id("chk--theme-switch").checked ? "dark" : "light");
	"btn--to-top" == t.id && (event.preventDefault(), $id("nav-bar").scrollIntoView({
		behavior: "smooth"
	}));
	t.closest(".adr") && (toMap(event, t.closest(".adr")));
	t.closest("#btn-selectall") && selectAllText(c || a);
	t.closest("#btn-copy") && toClipboard(c || a);
	t.closest("#btn-savecontact") && generateAndDownloadVCFfile(c || a, c ? true : false);
	t.closest("#btn-print") && printArticle(a);
	t.closest("#btn-qrcode") && showQRCode(c || a, c ? true : false);
	!t.closest("#apropos") && $id("apropos").removeAttribute("open");
	!t.closest("#qr-code, #btn-qrcode") && hideQRCode();
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
		targetArticle && targetArticle.scrollIntoView({
			behavior: "smooth"
		});
		$id("select--AZ").selectedIndex = 0;
	}
}

window.addEventListener("DOMContentLoaded", () => {
	$id("select--categories").selectedIndex = $id("select--ville").selectedIndex = $id("select--AZ").selectedIndex = 0;
	$id("text--resultats").innerHTML = $q("article").length + "&nbsp;r&eacute;sultats";
	setLocalities();
	setSelectableLetters();
	getVCARDUrlParamAndDownload();
	themeChecking();
});

window.addEventListener("load", () => {
	if (window.innerWidth > 900) {
		$id("main").classList.remove("flex");
		masonry = new Macy({
			container: "main",
			mobileFirst: true,
			columns: 3,
			margin: {
				y: 50,
				x: 30
			},
			breakAt: {
				1500: 4,
				940: 2,
				630: 1
			}
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
