# M3U Playlist Manager

A web-based application for creating, editing, and managing M3U playlists for IPTV channels. Features include channel management, playlist import/export, URL validation, and advanced filtering capabilities.

## Features

- **Channel Management**
  - Add, edit, and delete channels
  - Sort channels by Group ID and Name
  - Multiple stream URLs per channel

- **Playlist Operations**
  - Import/Export M3U playlists
  - Save/Load JSON playlists
  - Export filtered playlists by group or provider
  - Automatic URL validation

- **Advanced Filtering**
  - Filter by multiple criteria
  - Tag-based filter management
  - Real-time filtering
  - Maintains filter state during pagination

- **User Interface**
  - Responsive Bootstrap design
  - Paginated channel list
  - Intuitive form controls
  - Visual feedback for operations

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/m3u-playlist-manager.git
```

2. Install Python dependencies for URL validator:
```bash
pip install flask requests flask-cors
```

3. Start the URL validator server:
```bash
python3 url_validator.py
```

4. Open `index.html` in a web browser

## Dependencies

- Bootstrap 4.3.1
- Font Awesome 5.15.4
- Modern web browser with JavaScript enabled
- Python 3.x with Flask (for URL validator)

## Project Structure

```
m3u-playlist-manager/
├── index.html          # Main application HTML
├── app.js             # Application logic
├── styles.css         # Custom styling
├── url_validator.py   # URL validation server
├── Documentation.txt  # Detailed documentation
├── LICENSE           # MIT license
└── README.md         # This file
```

## Quick Start

1. Add channels using the form at the top
2. Use toolbar buttons for playlist operations
3. Apply filters using the filter controls
4. Export your playlist in M3U or JSON format

For detailed instructions, see [Documentation.txt](Documentation.txt).

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Bootstrap for the UI framework
- Font Awesome for icons
- Contributors and users of the project
