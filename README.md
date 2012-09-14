json-rpc-agent
==============

Agent for Interfacing with Collaborative Recommendation via JSON-RPC

*Nutraspace Agent Ver 0.1*
Nutraspace Agent Client interfaces with the server through the JSON-RPC protocol and uses jQueyr AJAX to help
access that protocol. The agent subscribes users with userID and profile information, and the server
generates recommendations on the fly as the user requests more. Optionally the user can interact with the
agent, sending back ratings or other types of feedback which in turn drives a collaborative filtering process.
