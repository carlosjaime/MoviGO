import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../constants/config.dart';

// Define Base URL - using the provided server URL
const String baseURL = AppConfig.serverUrl; 

Future<dynamic> fetchAPI(String url, {Map<String, String>? headers, Object? body, String method = 'GET'}) async {
  try {
    final fullUrl = url.startsWith("http") ? url : "$baseURL$url";
    final uri = Uri.parse(fullUrl);
    
    http.Response response;
    
    final effectiveHeaders = {
      'Content-Type': 'application/json',
      ...?headers,
    };
    
    final bodyString = body != null ? (body is String ? body : json.encode(body)) : null;

    if (method == 'POST') {
      response = await http.post(uri, headers: effectiveHeaders, body: bodyString);
    } else if (method == 'PUT') {
      response = await http.put(uri, headers: effectiveHeaders, body: bodyString);
    } else if (method == 'DELETE') {
        response = await http.delete(uri, headers: effectiveHeaders);
    } else {
      response = await http.get(uri, headers: effectiveHeaders);
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
        if (response.body.isEmpty) return {};
      return json.decode(response.body);
    } else {
       throw Exception('HTTP error! status: ${response.statusCode}');
    }
  } catch (error) {
    debugPrint("Fetch error: $error");
    rethrow;
  }
}