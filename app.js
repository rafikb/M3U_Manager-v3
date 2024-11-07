// Global variables
let currentPage = 1;
const itemsPerPage = 5;
let activeFilters = [];

// Add this helper function at the top of the file with other functions
async function checkServerAvailability() {
	try {
		const response = await fetch('http://localhost:5000/check_url', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				url: 'https://www.google.com' // Test URL
			})
		});
		return response.ok;
	} catch (error) {
		return false;
	}
}

// Wait for DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
	// Initialize event listeners
	initializeEventListeners();
	
	// Load channels on initial page load
	loadChannels();
});

// Initialize all event listeners
function initializeEventListeners() {
	// Form submission
	document.getElementById('channel-form').addEventListener('submit', handleChannelSubmit);
	
	// Playlist management
	document.getElementById('save-playlist').addEventListener('click', handleSavePlaylist);
	document.getElementById('load-playlist-button').addEventListener('click', handleLoadPlaylistClick);
	document.getElementById('load-playlist').addEventListener('change', handleLoadPlaylist);
	
	// Channel management
	document.getElementById('check-urls').addEventListener('click', handleCheckUrls);
	document.getElementById('sort-channels').addEventListener('click', handleSortChannels);
	
	// M3U operations
	document.getElementById('export-m3u').addEventListener('click', handleExportM3uClick);
	document.getElementById('exportOption').addEventListener('change', handleExportOptionChange);
	document.getElementById('exportConfirm').addEventListener('click', handleExportConfirm);
	document.getElementById('import-m3u-button').addEventListener('click', handleImportM3uClick);
	document.getElementById('import-m3u').addEventListener('change', handleImportM3u);
	
	// Filter controls
	document.getElementById('add-filter').addEventListener('click', handleAddFilter);
	
	// Add this line
	document.getElementById('add-channel-button').addEventListener('click', () => $('#channelModal').modal('show'));
	document.getElementById('save-channel').addEventListener('click', handleChannelSubmit);
}

// Channel form handler
function handleChannelSubmit(e) {
	if (e) e.preventDefault();
	
	var name = document.getElementById('name').value;
	var logoId = document.getElementById('logo-id').value;
	var groupId = document.getElementById('group-id').value;
	var epgId = document.getElementById('epg-id').value;
	var providerId = document.getElementById('provider-id').value;
	var streamUrls = document.getElementById('stream-urls').value.split('\n');
	var channels = JSON.parse(localStorage.getItem('channels')) || [];
	var existingChannelIndex = channels.findIndex(function(channel) {
		return channel.name === name || channel.epgId === epgId;
	});
	if (existingChannelIndex !== -1) {
		if (confirm('A channel with this name or EPG ID already exists. Do you want to update it?')) {
			var existingStreamUrls = channels[existingChannelIndex].streamUrls;
			channels[existingChannelIndex] = {
				name,
				logoId,
				groupId,
				epgId,
				providerId,
				streamUrls: [...new Set([...existingStreamUrls, ...streamUrls])]
			};
		}
	} else {
		channels.push({
			name,
			logoId,
			groupId,
			epgId,
			providerId,
			streamUrls
		});
	}
	localStorage.setItem('channels', JSON.stringify(channels));
	loadChannels();
	
	// Add these lines at the end
	$('#channelModal').modal('hide');
	document.getElementById('channel-form').reset();
}

// Channel loading and display
function loadChannels() {
	if (activeFilters.length > 0) {
		applyFilters();
	} else {
		const channels = JSON.parse(localStorage.getItem('channels')) || [];
		displayChannels(channels);
	}
}

// New function to handle channel display
function displayChannels(channels) {
	const channelsContainer = document.getElementById('channels-container');
	const emptyMessage = document.getElementById('empty-message');
	
	channelsContainer.innerHTML = '';
	
	if (channels.length === 0) {
		emptyMessage.style.display = 'block';
		return;
	}
	
	emptyMessage.style.display = 'none';
	
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = Math.min(startIndex + itemsPerPage, channels.length);
	
	// Add channel cards
	for (let i = startIndex; i < endIndex; i++) {
		let channel = channels[i];
		if (!channel.streamUrls) {
			channel.streamUrls = [];
		}
		var div = document.createElement('div');
		div.className = 'card mb-3';
		var cardBody = document.createElement('div');
		cardBody.className = 'card-body';
		cardBody.innerHTML = '<h5 class="card-title">' + channel.name + '</h5>' +
			'<p class="card-text">Logo ID: ' + channel.logoId + '</p>' +
			'<p class="card-text">Group ID: ' + channel.groupId + '</p>' +
			'<p class="card-text">EPG ID: ' + channel.epgId + '</p>' +
			'<p class="card-text">Provider ID: ' + channel.providerId + '</p>' +
			'<p class="card-text">Stream URLs: ' + channel.streamUrls.join(', ') + '</p>';
		var deleteButton = document.createElement('button');
		deleteButton.textContent = 'Delete';
		deleteButton.className = 'btn btn-danger';
		deleteButton.addEventListener('click', function() {
			channels.splice(i, 1);
			localStorage.setItem('channels', JSON.stringify(channels));
			loadChannels();
		});
		var editButton = document.createElement('button');
		editButton.textContent = 'Edit';
		editButton.className = 'btn btn-primary ml-2';
		editButton.addEventListener('click', function() {
			document.getElementById('name').value = channel.name;
			document.getElementById('logo-id').value = channel.logoId;
			document.getElementById('group-id').value = channel.groupId;
			document.getElementById('epg-id').value = channel.epgId;
			document.getElementById('provider-id').value = channel.providerId;
			document.getElementById('stream-urls').value = channel.streamUrls.join('\n');
			$('#channelModal').modal('show');
		});

		cardBody.appendChild(deleteButton);
		cardBody.appendChild(editButton);
		div.appendChild(cardBody);
		channelsContainer.appendChild(div);
	}

	// Modify pagination to work with filtered results
	const totalPages = Math.ceil(channels.length / itemsPerPage);
	if (totalPages > 1) {
		const pagination = document.createElement('nav');
		const ul = document.createElement('ul');
		ul.className = 'pagination justify-content-center';

		// Previous button
		const prevLi = document.createElement('li');
		prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
		const prevA = document.createElement('a');
		prevA.className = 'page-link';
		prevA.href = '#';
		prevA.textContent = 'Previous';
		prevA.addEventListener('click', (e) => {
			e.preventDefault();
			if (currentPage > 1) {
				currentPage--;
				displayChannels(channels);
			}
		});
		prevLi.appendChild(prevA);
		ul.appendChild(prevLi);

		// Calculate visible page range
		let startPage = Math.max(1, currentPage - 2);
		let endPage = Math.min(totalPages, startPage + 4);
		
		// Adjust start if we're near the end
		if (endPage - startPage < 4) {
			startPage = Math.max(1, endPage - 4);
		}

		// First page if not in range
		if (startPage > 1) {
			const li = document.createElement('li');
			li.className = 'page-item';
			const a = document.createElement('a');
			a.className = 'page-link';
			a.href = '#';
			a.textContent = '1';
			a.addEventListener('click', (e) => {
				e.preventDefault();
				currentPage = 1;
				displayChannels(channels);
			});
			li.appendChild(a);
			ul.appendChild(li);

			if (startPage > 2) {
				const ellipsis = document.createElement('li');
				ellipsis.className = 'page-item disabled';
				ellipsis.innerHTML = '<span class="page-link">...</span>';
				ul.appendChild(ellipsis);
			}
		}

		// Visible pages
		for (let i = startPage; i <= endPage; i++) {
			const li = document.createElement('li');
			li.className = `page-item ${i === currentPage ? 'active' : ''}`;
			const a = document.createElement('a');
			a.className = 'page-link';
			a.href = '#';
			a.textContent = i;
			const pageNum = i; // Store the page number
			a.addEventListener('click', (e) => {
				e.preventDefault();
				currentPage = pageNum;
				displayChannels(channels);
			});
			li.appendChild(a);
			ul.appendChild(li);
		}

		// Last page if not in range
		if (endPage < totalPages) {
			if (endPage < totalPages - 1) {
				const ellipsis = document.createElement('li');
				ellipsis.className = 'page-item disabled';
				ellipsis.innerHTML = '<span class="page-link">...</span>';
				ul.appendChild(ellipsis);
			}

			const li = document.createElement('li');
			li.className = 'page-item';
			const a = document.createElement('a');
			a.className = 'page-link';
			a.href = '#';
			a.textContent = totalPages;
			a.addEventListener('click', (e) => {
				e.preventDefault();
				currentPage = totalPages;
				displayChannels(channels);
			});
			li.appendChild(a);
			ul.appendChild(li);
		}

		// Next button
		const nextLi = document.createElement('li');
		nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
		const nextA = document.createElement('a');
		nextA.className = 'page-link';
		nextA.href = '#';
		nextA.textContent = 'Next';
		nextA.addEventListener('click', (e) => {
			e.preventDefault();
			if (currentPage < totalPages) {
				currentPage++;
				displayChannels(channels);
			}
		});
		nextLi.appendChild(nextA);
		ul.appendChild(nextLi);

		pagination.appendChild(ul);
		channelsContainer.appendChild(pagination);
	}
}

// Playlist save handler
function handleSavePlaylist() {
	var channels = JSON.parse(localStorage.getItem('channels')) || [];
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(channels));
	var downloadAnchorNode = document.createElement('a');
	downloadAnchorNode.setAttribute("href", dataStr);
	downloadAnchorNode.setAttribute("download", "playlist.json");
	document.body.appendChild(downloadAnchorNode); // required for firefox
	downloadAnchorNode.click();
	downloadAnchorNode.remove();
}

// Playlist load handlers
function handleLoadPlaylistClick() {
	document.getElementById('load-playlist').click();
}

function handleLoadPlaylist(e) {
	var file = e.target.files[0];
	if (!file) {
		return;
	}
	var reader = new FileReader();
	reader.onload = function(e) {
		var contents = e.target.result;
		localStorage.setItem('channels', contents);
		loadChannels();
	};
	reader.readAsText(file);
}

// URL checking handler
async function handleCheckUrls() {
	// First check if the server is available
	const isServerAvailable = await checkServerAvailability();
	
	if (!isServerAvailable) {
		alert('URL validator server is not available. Please make sure the server is running on localhost:5000');
		return;
	}

	var channels = JSON.parse(localStorage.getItem('channels')) || [];
	var promises = []; // Array to hold all fetch promises
	
	channels.forEach(function(channel, index) {
		channel.streamUrls.forEach(function(url, i) {
			var promise = fetch('http://localhost:5000/check_url', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					url: url
				})
			})
			.then(response => response.json())
			.then(data => {
				if (data.status !== 200) {
					// Move the URL to the end of the list
					channel.streamUrls.push(channel.streamUrls.splice(i, 1)[0]);
				}
			})
			.catch(error => {
				console.error('Error checking URL:', url, error);
			});
			promises.push(promise);
		});
	});

	// Wait for all fetch promises to complete
	Promise.all(promises).then(function() {
		localStorage.setItem('channels', JSON.stringify(channels));
			loadChannels();
			alert('URL check completed!');
	}).catch(function(error) {
		console.error('Error during URL checks:', error);
		alert('An error occurred while checking URLs. Please try again.');
	});
}

// Channel sorting handler
function handleSortChannels() {
	var channels = JSON.parse(localStorage.getItem('channels')) || [];
	channels.sort(function(a, b) {
		if (a.groupId < b.groupId) {
			return -1;
		}
		if (a.groupId > b.groupId) {
			return 1;
		}
		// If Group IDs are equal, sort by name
		if (a.name < b.name) {
			return -1;
		}
		if (a.name > b.name) {
			return 1;
		}
		return 0;
	});
	localStorage.setItem('channels', JSON.stringify(channels));
	loadChannels();
	alert('Channels sorted successfully!');
}

// M3U export handlers
function handleExportM3uClick() {
	$('#exportModal').modal('show');
}

function handleExportOptionChange() {
	if (this.value === 'all') {
		document.getElementById('exportValue').style.display = 'none';
	} else {
		document.getElementById('exportValue').style.display = 'block';
	}
}

function handleExportConfirm() {
	var channels = JSON.parse(localStorage.getItem('channels')) || [];
	var exportOption = document.getElementById('exportOption').value;
	var exportValue = document.getElementById('exportValue').value;

	if (exportOption !== 'all') {
		channels = channels.filter(function(channel) {
			return channel[exportOption === 'group' ? 'groupId' : 'providerId'] === exportValue;
		});
	}
	var m3uContent = "#EXTM3U\n";

	channels.forEach(function(channel) {
		m3uContent += "#EXTINF:-1 tvg-id=\"" + channel.epgId + "\" tvg-name=\"" + channel.name + "\" tvg-logo=\"" + channel.logoId + "\" group-title=\"" + channel.groupId + "\", " + channel.name + "\n";
		m3uContent += channel.streamUrls[0] + "\n";
	});

	var dataStr = "data:audio/x-mpegurl;charset=utf-8," + encodeURIComponent(m3uContent);
	var downloadAnchorNode = document.createElement('a');
	downloadAnchorNode.setAttribute("href", dataStr);
	downloadAnchorNode.setAttribute("download", "playlist.m3u");
	document.body.appendChild(downloadAnchorNode); // required for firefox
	downloadAnchorNode.click();
	downloadAnchorNode.remove();

	$('#exportModal').modal('hide');
}

// M3U import handlers
function handleImportM3uClick() {
	document.getElementById('import-m3u').click();
}

function handleImportM3u(e) {
	var file = e.target.files[0];
	if (!file) {
		return;
	}
	var reader = new FileReader();
	reader.onload = function(e) {
		var contents = e.target.result;
		var lines = contents.split('\n');
		var channels = [];
		var currentChannel = null;

		lines.forEach(function(line) {
			if (line.startsWith('#EXTINF:')) {
				if (currentChannel) {
					channels.push(currentChannel);
				}
				currentChannel = {};
				var matches = line.match(/tvg-id="([^"]*)".*tvg-logo="([^"]*)".*group-title="([^"]*)",\s*(.*)/);
				if (matches) {
					currentChannel.epgId = matches[1] ? matches[1] : "";
					currentChannel.logoId = matches[2] ? matches[2] : "";
					currentChannel.groupId = matches[3] ? matches[3] : "";
					// Split the remaining string on the last comma to separate the name and the rest of the string
					var nameAndRest = matches[4].split(/,(.+)/);
					currentChannel.name = nameAndRest[0] ? nameAndRest[0].trim() : "";
					currentChannel.providerId = ""; // Provider ID is not available in the M3U file
				}
			} else if (line.startsWith('http')) {
				currentChannel.streamUrls = [line.trim()];
			}
		});


		if (currentChannel) {
			channels.push(currentChannel);
		}

		localStorage.setItem('channels', JSON.stringify(channels));
		loadChannels();
	};
	reader.readAsText(file);
}

// Filter functions
function handleAddFilter() {
	const searchTerm = document.getElementById('search-input').value.trim();
	const filterType = document.getElementById('filter-type').value;
	
	if (!searchTerm) return;
	
	const newFilter = {
		id: Date.now(),
		type: filterType,
		term: searchTerm
	};
	
	activeFilters.push(newFilter);
	document.getElementById('search-input').value = '';
	updateFilterTags();
	applyFilters();
}

function updateFilterTags() {
	const filterContainer = document.getElementById('active-filters');
	filterContainer.innerHTML = '';
	
	activeFilters.forEach(filter => {
		const tag = document.createElement('span');
		tag.className = 'badge badge-primary mr-2 mb-2 p-2';
		tag.style.fontSize = '0.9rem';
		tag.innerHTML = `
			${filter.type === 'all' ? 'All' : filter.type}: ${filter.term}
			<i class="fas fa-times ml-2" style="cursor: pointer;"></i>
		`;
		
		tag.querySelector('i').addEventListener('click', () => {
			activeFilters = activeFilters.filter(f => f.id !== filter.id);
			updateFilterTags();
			applyFilters();
		});
		
		filterContainer.appendChild(tag);
	});
}

function applyFilters() {
	const channels = JSON.parse(localStorage.getItem('channels')) || [];
	
	const filteredChannels = channels.filter(channel => {
		return activeFilters.every(filter => {
			if (filter.type === 'all') {
				return Object.values(channel).some(value => 
					String(value).toLowerCase().includes(filter.term.toLowerCase())
				);
			}
			return String(channel[filter.type])
				.toLowerCase()
				.includes(filter.term.toLowerCase());
		});
	});
	
	currentPage = 1; // Reset to first page when filters change
	displayChannels(filteredChannels);
}
