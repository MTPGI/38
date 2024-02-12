'use strict';
var
	masonry,
	filteredArticlesCount = 0,
	hoveredCardOrArticle;
const
	/* Shortcut functions */
	$id = x => {
		return document.getElementById(x)
	},
	$q = Element.prototype.$q = function(q) {
		let r = (this instanceof Element ? this : document).querySelectorAll(q);
		return r.length === 1 ? r[0] : r.length ? Array.from(r) : null;
	},
	articles = $id('main').$q('article'),
	articlesLength = articles.length,
	selection = document.getSelection(),
	isDesktop = (!/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) && 600 < window.innerWidth,
	correctHeight = () => {
		!isDesktop && document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px')
	},
	getVCARDUrlParamAndDownload = () => {
		const params = new URLSearchParams(window.location.search),
			vcarddata = params.get('vcard'),
			index = +params.get('i');
		if (vcarddata) {
			if (index) {
				exportVCARD($q('[data-vcard=' + vcarddata + ']').querySelectorAll('.card')[index], true)
			} else {
				exportVCARD($q('[data-vcard=' + vcarddata + ']'), false)
			}
		}
	},
	filtrerArticles = () => {
		filteredArticlesCount = 0;
		if (0 !== $id('select--categories').selectedIndex || 0 !== $id('select--ville').selectedIndex) {
			$id('select--AZ').setAttribute('disabled', 'true');
			$id('select--AZ').setAttribute('aria-disabled', 'true');
			$id('select--AZ').parentElement.classList.add('disabled-within');
		} else {
			$id('select--AZ').removeAttribute('disabled');
			$id('select--AZ').removeAttribute('aria-disabled');
			$id('select--AZ').parentElement.classList.remove('disabled-within');
		}
		for (let i = articlesLength; i--;) {
			let data = articles[i].getAttribute('data-hashtag'),
				test = data.includes($id('select--categories').value) && data.includes($id('select--ville').value);
			if (test) {
				articles[i].classList.remove('hide')
			} else {
				articles[i].classList.add('hide')
			}
			test && filteredArticlesCount++
		}
		$id('text--resultats').innerHTML = (0 == filteredArticlesCount ? 'aucun' : filteredArticlesCount) + '&nbsp;r&eacute;sultat' + (1 < filteredArticlesCount ? 's' : '')
		masonry && masonry.recalculate(!0, !0);
	},
	selectAll = (a) => {
		if (window.getSelection) {
			selection.removeAllRanges();
			let range = document.createRange();
			range.setStart(a.querySelector('header, h3'), 0)
			range.setEndBefore($id('modale'))
			window.getSelection().addRange(range);
		}
	},
	scrollTo = (t) => {
		let elem = $q(t.href)
		elem.style.classList.remove('hide');
		elem.scrollIntoView({
			behavior: 'smooth'
		});
	},
	toMap = (e, t) => {
		if (isDesktop) {
			e.preventDefault();
			let loc = t.href.split(/[:,]/);
			window.open('https://www.openstreetmap.org/directions?to=' + loc[1] + ',' + loc[2] + '#map=18/' + loc[1] + '/' + loc[2], '_blank');
		}
	},
	toClipboard = (text) => {
		const copylistener = (e) => {
			e.preventDefault();
			if (e.clipboardData) {
				e.clipboardData.setData('text/plain', text.innerText);
				e.clipboardData.setData('text/html', text.innerHTML);
				document.documentElement.style.setProperty('--copy-opacity', '1');
				setTimeout(() => {
					document.documentElement.style.setProperty('--copy-opacity', '0');
				}, 3000);
			}
			document.removeEventListener('copy', copylistener);
		};
		document.addEventListener("copy", copylistener);
		document.execCommand("copy");
	},
	printArticle = (article) => {
		const response = confirm("Par souci d'économie, le document a été passé en niveau de gris.\n\nÉconomisez du papier et privilégiez la copie numérique\nou activez le recto/verso !\n\nJe souhaite imprimer ?");
		if (!response) return false;
		let frame1 = document.createElement('iframe');
		frame1.name = "frame1";
		document.body.appendChild(frame1);
		var frameDoc = (frame1.contentWindow) ? frame1.contentWindow : (frame1.contentDocument.document) ? frame1.contentDocument.document : frame1.contentDocument;
		frameDoc.document.open();
		frameDoc.document.write(
			"<!DOCTYPE html><html lang=\"fr\"><head><meta charset=\"utf-8\"><title>" +
			article.querySelector('h2').innerText +
			"</title><link rel=\"stylesheet\" href=\"style.css\" type=\"text/css\" /><style>.card {break-inside: avoid}</style></head><body>" +
			article.outerHTML +
			"</body></html>");
		frameDoc.document.close();
		setTimeout(function() {
			window.frames["frame1"].focus();
			window.frames["frame1"].print();
			document.body.removeChild(frame1);
		}, 500);
	},
	populateDatalist = () => {
		function createItem(val) {
			let item = document.createElement('option');
			item.value = val;
			$id('searchlist').appendChild(item);
		}
		$id('select--categories').$q('option').forEach((opt, i) => {
			if (i === 0) return
			createItem(opt.innerText)
		});
		$id('select--ville').$q('option').forEach((opt, i) => {
			if (i === 0) return
			createItem(opt.innerText)
		});
		Array.from(articles).forEach((article) => {
			createItem($q('h2').innerText)
		});
	},
	generateAndDownloadVCFfile = (artOrCard, isCard) => {
		const
			parentArticle = isCard ? artOrCard.parentElement : artOrCard,
			vcard_name = isCard ? (artOrCard.querySelector('h3').textContent.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9\s-_]/gi, '').replace(/[\s_-]+/g, '_')) : parentArticle.getAttribute('data-vcard'),
			txt = generateVCARDtext(artOrCard, isCard),
			textToBLOB = new Blob([txt], {
				type: 'text/vcard'
			}),
			newLink = document.createElement("a");
		newLink.download = vcard_name + '.vcf';
		if (window.webkitURL != null) {
			newLink.href = window.webkitURL.createObjectURL(textToBLOB);
		} else {
			newLink.href = window.URL.createObjectURL(textToBLOB);
			newLink.style.display = "none";
			document.body.appendChild(newLink);
		}
		newLink.click();
		newLink.remove();
	},
	generateVCARDtext = (artOrCard, isCard) => {
		const
			parentArticle = isCard ? artOrCard.parentElement : artOrCard,
			vcard_name = parentArticle.getAttribute('data-vcard'),
			firstCard = parentArticle.querySelector('.card');
		var feed;

		function generateCard(content) {
			let vcard_text = 'BEGIN:VCARD\nVERSION:3.0\nPRODID:-//MTPGI38//NONSGML v1.0//FR\nTZ:+01:00\n';
			const index = isCard ? '&i=' + Array.from(parentArticle.querySelectorAll('.card')).indexOf(artOrCard) : '';
			const escapeChar = txt => txt.replace(/[\n\r\t]+/g, ' ').replace(/\(.+?\)/, '').replace(/([\\,;:])/g, '\\$1');
			vcard_text += 'SOURCE:http://mtpgi.github.io/38?vcard=' + vcard_name + index + '\n';
			vcard_text += 'REV:' + $id('revision').innerText.split('/').reverse().join('-') + 'T00:00:00Z\n';
			const name = content.find(el => el.nodeName === 'H2') || content.find(el => el.nodeName === 'H3');
			vcard_text += 'FN:' + escapeChar(name.innerText) + '\n';
			const note = name.querySelector('p');
			note && (vcard_text += 'NOTE:' + escapeChar(note.innerText) + '\n')
			content.filter(el => el.classList.contains('tel')).forEach(function(n) {
				const telTypes = ['HOME', 'WORK', 'PREF', 'VOICE', 'FAX', 'MSG', 'CELL', 'VIDEO', 'TEXTPHONE', 'TEXT'];
				const telType = (n.href.startsWith('tel:+336') || n.href.startsWith('tel:06')) ? 'CELL' : 'VOICE';
				const pref = n.classList.contains('pref') ? ';PREF=1' : '';
				vcard_text += 'TEL;TYPE=' + telType + pref + ':' + n.href.split(':')[1] + '\n';
			});
			content.filter(el => el.classList.contains('email')).forEach(function(n) {
				vcard_text += 'EMAIL:' + n.href.split(':')[1] + '\n'
			});
			content.filter(el => el.classList.contains('url')).forEach(function(n) {
				vcard_text += 'URL:' + n.href + '\n'
			});
			content.filter(el => el.className.match(/^facebook|instagram|twitter$/)).forEach(function(n) {
				const rs = n.classList.value;
				vcard_text += `X-SOCIALPROFILE;type=${rs};x-user=${rs}user:${n.href}\n`
			});

			content.filter(el => el.classList.contains('adr')).forEach(function(n) {
			  const postOfficeBox = n.querySelector('.post-office-box'),
					extendedAddress = n.querySelector('.extended-address'),
					streetAddress = n.querySelector('.street-address'),
					locality = n.querySelector('.locality'),
					postalCode = n.querySelector('.postal-code'),
					getContent = c => {
					  return c ? c.innerText.replace(/([\\,;:])/g, '\\$1')
						.replace(/[\n\r]+/, '\\n') :
						'';
					},
					adr = 'ADR:' 
						  + getContent(postOfficeBox) + ';'
						  + getContent(extendedAddress) + ';'
						  + getContent(streetAddress) + ';'
						  + getContent(locality) + ';;'
						  + getContent(postalCode) 
						  + ';FRANCE\n',
					geoURI = n.href;
				if (postOfficeBox || extendedAddress || streetAddress || locality || postalCode) {
					vcard_text += adr
				}
				if (geoURI) {
					const spl = geoURI.split(/[:,]/);
					vcard_text += 'GEO:' + spl[1] + ';' + spl[2] + '\n';
				}
			});
			vcard_text += 'END:VCARD';
			return vcard_text;
		}

		function extractBeforeFirstCard() {
			const elementsBeforeFirstCard = [];
			const childNodes = Array.from(firstCard.parentNode.childNodes);
			for (let node of childNodes) {
				if (node === firstCard)  break;
				if (node.nodeType === 1) elementsBeforeFirstCard.push(node);
			}
			return elementsBeforeFirstCard
		}
		if (isCard) {
			const cardContent = artOrCard.$q('h3, .adr, .url, .tel, .email, .facebook, .twitter, .instagram');
			feed = [...extractBeforeFirstCard(), ...cardContent];
			return generateCard(feed, isCard);
		} else {
			if (firstCard) {
				feed = [];
				parentArticle.querySelectorAll('.card').forEach(function(card) {
					const cardContent = card.$q('h3, .adr, .url, .tel, .email, .facebook, .twitter, .instagram');
					feed.push([...extractBeforeFirstCard(), ...cardContent]);
				});
				let fusionnedVcard = '';
				for (let i = 0; i < feed.length; i++) {
					fusionnedVcard += generateCard(feed[i]) + '\n';
				}
				return fusionnedVcard
			} else {
				feed = parentArticle.$q('h2, h2 p, h3, .adr, .url, .tel, .email, .facebook, .twitter, .instagram');
				return generateCard(feed);
			}
		}
	},
	handleTouchOrHover = (event) => {
		const
			article = event.target.closest('article'),
			card = event.target.closest('.card');
		if (event.type == 'mouseover' && $id('qr-code').classList.contains('show')) {
			return false
		}
		if (!article) {
			hoveredCardOrArticle = false;
			$id('modale').classList.remove('show');
			hideQRCode();
			return false
		}
		if (card) {
			$id('btn-qrcode').classList.remove('hide');
			if (card !== hoveredCardOrArticle) {
				hideQRCode();
				hoveredCardOrArticle = card;
				card.appendChild($id('modale'));
				$id('modale').classList.add('show');
			}
		} else {
			let hasCard = article.querySelector('.card');
			if (hasCard) {
				$id('btn-qrcode').classList.add('hide');
			} else {
				$id('btn-qrcode').classList.remove('hide');
			}
			if (article !== hoveredCardOrArticle) {
				hideQRCode();
				hoveredCardOrArticle = article;
				article.appendChild($id('modale'));
				$id('modale').classList.add('show');
			}
		}
	},
	handleClick = (event) => {
		const
			t = event.target,
			a = t.closest('article'),
			c = t.closest('.card');
		'link--to-top' == t.id	 			&& (event.preventDefault(), $q('nav').scrollIntoView({behavior: 'smooth'}));
		'goto' == t.className 				&& (event.preventDefault(), scrollTo(t));
		t.closest('.adr') 					&& (toMap(event, t.closest('.adr')));
		t.closest('#btn-selectall')			&& selectAll(c || a);
		t.closest('#btn-copy') 				&& toClipboard(c || a);
		t.closest('#btn-savecontact') 		&& generateAndDownloadVCFfile(c || a, c ? true : false);
		t.closest('#btn-print') 			&& printArticle(a);
		t.closest('#btn-qrcode') 			&& showQRCode(c || a, c ? true : false);
		!t.closest('#apropos') 				&& $id('apropos').removeAttribute('open');
		!t.closest('#qr-code, #btn-qrcode') && hideQRCode();
	},
	handleScroll = (event) => {
		let toTopClassList = $id('link--to-top').classList;
		if ($id('container').scrollTop > window.innerHeight) {
			toTopClassList.add('show');
		} else {
			toTopClassList.remove('show');
		}
	},
	handleChange = (event) => {
		let t = event.target;
		$id('container').scrollTop = 0;
		(t == $id('select--categories') || t == $id('select--ville')) && filtrerArticles();
		t == $id('select--AZ') && ($id($id('select--AZ').value).scrollIntoView({behavior: 'smooth'}), $id('select--AZ').selectedIndex = 0);
	},
	showQRCode = (artOrCard, isCard) => {
		if ($id('qr-code').classList.contains('show')) {
			hideQRCode();
			return false
		}
		const img = $id('qr-code').querySelector('img');
		img && img.remove();
		const data = generateVCARDtext(artOrCard, isCard);
		const qr = qrcode(0, 'L');
		qr.addData(data, 'Byte');
		qr.make();
		$id('qr-code').innerHTML = qr.createImgTag(5, 0);
		$id('qr-code').classList.add('show');
	},
	hideQRCode = () => {
		let img = $id('qr-code').querySelector('img');
		img && img.remove();
		$id('qr-code').classList.remove('show');
	},
	encodeLinks = () => {
		function encodeAllCharacters(str) {
			return Array.from(str).map(char => {
				return '%' + char.charCodeAt(0).toString(16).toUpperCase();
			}).join('');
		}
		const emailLinks = document.querySelectorAll('a.email');
		const telLinks = document.querySelectorAll('a.tel');
		emailLinks.forEach(link => {
			const href = link.getAttribute('href');
			if (href.startsWith('mailto:')) {
				const encodedHref = 'mailto:' + encodeAllCharacters(href.substring(7));
				link.setAttribute('href', encodedHref);
			}
		});
		telLinks.forEach(link => {
			const href = link.getAttribute('href');
			if (href.startsWith('tel:')) {
				const encodedHref = 'tel:' + encodeAllCharacters(href.substring(4));
				link.setAttribute('href', encodedHref);
			}
		});
		return document.documentElement.innerHTML;
	},
	handleBeforePrint = (event) => {
		/*event.preventDefault();
		const response = confirm("Par souci d'économie, le document a été passé en niveau de gris.\n\nÉconomisez du papier et privilégiez la copie numérique\nou activez le recto/verso !\n\nJe souhaite imprimer ?");
		if (response) {
		  window.removeEventListener("beforeprint", handleBeforePrint);
		  window.print();
		}*/
	},
	handleAfterPrint = () => {
		//window.addEventListener("beforeprint", handleBeforePrint);
	},
	handleDOMContentLoaded = () => {
		$id('select--categories').selectedIndex = $id('select--ville').selectedIndex = $id('select--AZ').selectedIndex = 0;
		$id('text--resultats').innerHTML = articlesLength + '&nbsp;r&eacute;sultats';
		//populateDatalist(); A FINIR
		getVCARDUrlParamAndDownload();
	},
	handleWindowLoad = () => {
		if (isDesktop && window.innerWidth > 900) {
			$id('main').classList.remove('flex');
			masonry = new Macy({
				container: 'main',
				mobileFirst: true,
				columns: 3,
				margin: {y: 50,x: 30},
				breakAt: {
					1500: 4,
					940: 2,
					630: 1
				}
			});
		}
		correctHeight();
	};

window.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
window.addEventListener('load', handleWindowLoad);
window.addEventListener('resize', correctHeight);
window.addEventListener("beforeprint", handleBeforePrint);
window.addEventListener("afterprint", handleAfterPrint);
document.addEventListener('touchstart', handleTouchOrHover);
document.addEventListener('mouseover', handleTouchOrHover);
document.addEventListener('click', handleClick);
document.addEventListener('change', handleChange);
$id('container').addEventListener('scroll', handleScroll);
