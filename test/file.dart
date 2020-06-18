import 'dart:io';

import 'package:test/test.dart';

void main() {
  test('test1', () {
    expect(
        'Lorem ipsum dolor sit amet. A', equals('Lorem ipsum dolor sit amet.'));
  });

  test('test2', () {
    (new HttpClient()).get("http://github.com", 1234, "/");
  });

  test('test3', () {
    throw Exception('fail');
  });
}
